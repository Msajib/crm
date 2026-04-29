import { Injectable, Logger, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocialApiService } from './social-api.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    @Inject(PrismaService)
    private prisma: PrismaService,
    @Inject(SocialApiService)
    private socialApi: SocialApiService,
  ) {}

  async connectSocial(tenantId: string, data: { platform: string, externalId: string, accessToken: string }) {
    try {
      const existing = await this.prisma.socialAccount.findFirst({
        where: { tenantId, platform: data.platform.toUpperCase(), externalId: data.externalId }
      });

      if (existing) {
        return await this.prisma.socialAccount.update({
          where: { id: existing.id },
          data: {
            accessToken: data.accessToken,
            syncStatus: 'SYNCED',
            lastSyncedAt: new Date(),
          }
        });
      }

      return await this.prisma.socialAccount.create({
        data: {
          tenantId,
          platform: data.platform.toUpperCase(),
          externalId: data.externalId,
          accessToken: data.accessToken,
          syncStatus: 'SYNCED',
          lastSyncedAt: new Date(),
        }
      });
    } catch (error) {
      this.logger.error(`Failed to connect social account: ${error.message}`);
      throw new BadRequestException('Could not connect social account.');
    }
  }

  async saveConfig(tenantId: string, data: { platform: string, appId: string, appSecret?: string, settings?: any }) {
    try {
      const existing = await this.prisma.socialCredential.findUnique({
        where: {
          tenantId_platform: {
            tenantId,
            platform: data.platform.toUpperCase(),
          },
        }
      });

      if (existing) {
        return await this.prisma.socialCredential.update({
          where: { id: existing.id },
          data: {
            appId: data.appId !== undefined ? data.appId : existing.appId,
            ...(data.appSecret !== undefined && { appSecret: data.appSecret }),
            settings: data.settings !== undefined ? data.settings : existing.settings,
          }
        });
      } else {
        if (!data.appSecret) {
          throw new BadRequestException('Application secret is required for new configurations.');
        }
        return await this.prisma.socialCredential.create({
          data: {
            tenantId,
            platform: data.platform.toUpperCase(),
            appId: data.appId,
            appSecret: data.appSecret,
            settings: data.settings || {},
          }
        });
      }
    } catch (error) {
      this.logger.error(`Failed to save config for ${data.platform}: ${error.message}`);
      require('fs').writeFileSync('C:\\Users\\Elitebook\\Desktop\\Projects\\CRM\\apps\\marketing-service\\error_log.txt', error.stack || error.message);
      throw error;
    }
  }

  async getConfigs(tenantId: string) {
    return this.prisma.socialCredential.findMany({
      where: { tenantId },
      select: {
        platform: true,
        appId: true,
        settings: true,
        createdAt: true,
      }
    });
  }

  // ─── LEAD PROCESSING ───────────────────────────────────────

  async processSocialLead(platform: string, data: { leadgenId: string, pageId: string, rawData: any }) {
    this.logger.log(`Processing ${platform} lead: ${data.leadgenId}`);

    // 1. Find subscription to get tenantId
    const subscription = await this.prisma.webhookSubscription.findFirst({
      where: { platform, externalId: data.pageId }
    });

    if (!subscription) {
      this.logger.error(`No subscription found for ${platform} Page: ${data.pageId}`);
      return;
    }

    const tenantId = subscription.tenantId;

    // 2. Get Access Token for this tenant
    const account = await this.prisma.socialAccount.findFirst({
      where: { tenantId, platform }
    });

    if (!account) {
      this.logger.error(`No connected account for tenant ${tenantId} on ${platform}`);
      return;
    }

    // 3. Fetch full lead details (In production, use real API)
    // For now, we simulate or use the socialApi service
    let leadInfo: any = {
      firstName: 'Social',
      lastName: 'Lead',
      email: `lead_${data.leadgenId}@example.com`,
      phone: '+1234567890',
      source: `${platform}_ADS`
    };

    try {
      // leadInfo = await this.socialApi.getFacebookLeadDetails(data.leadgenId, account.accessToken);
    } catch (err) {
      this.logger.warn('Failed to fetch lead details from API, using payload data.');
    }

    // 4. Create Contact in CRM Service
    try {
      const crmUrl = process.env.CRM_SERVICE_URL || 'http://localhost:3003';
      await axios.post(`${crmUrl}/api/v1/contacts`, leadInfo, {
        headers: { 'x-tenant-id': tenantId, 'x-user-id': 'system' }
      });
      this.logger.log(`Lead synced to CRM: ${leadInfo.email}`);
    } catch (err) {
      this.logger.error(`Failed to sync lead to CRM: ${err.message}`);
    }

    // 5. Notify Admin via Communication Service
    try {
      const commUrl = process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004';
      await axios.post(`${commUrl}/api/v1/communications/notify`, {
        type: 'NEW_LEAD',
        title: 'New Social Lead Onboarded',
        message: `A new lead from ${platform} has been added to your CRM: ${leadInfo.firstName} ${leadInfo.lastName}`,
        tenantId
      });
    } catch (err) {
      this.logger.error(`Failed to notify admin: ${err.message}`);
    }
  }

  // ─── ANALYTICS SYNC ────────────────────────────────────────

  async syncAnalytics(tenantId: string) {
    const creds = await this.prisma.socialCredential.findMany({ where: { tenantId } });
    const results = [];

    for (const cred of creds) {
      try {
        let stats: any = null;
        let pageName = 'Linked';
        let pictureUrl = null;
        let followersCount = 0;
        const settings = cred.settings as any || {};
        const pageAccessToken = settings.pageAccessToken;
        
        if (cred.platform === 'FACEBOOK' && pageAccessToken) {
           try {
               const details = await this.socialApi.getFacebookPageDetails(pageAccessToken);
               pageName = details.name;
               pictureUrl = details.picture?.data?.url || null;
               followersCount = details.followers_count || 0;
               
               try {
                   const realStats = await this.socialApi.getFacebookPageStats(details.id, pageAccessToken);
                   stats = {
                     reach: realStats.data?.find((m: any) => m.name === 'page_impressions_unique')?.values?.[0]?.value || 0,
                     engagement: realStats.data?.find((m: any) => m.name === 'page_post_engagements')?.values?.[0]?.value || 0,
                     impressions: realStats.data?.find((m: any) => m.name === 'page_impressions')?.values?.[0]?.value || 0,
                     date: new Date().toISOString()
                   };
               } catch (statsError: any) {
                   this.logger.warn(`Insights Error for ${cred.platform}: ${statsError.message}. Using fallback stats.`);
                   stats = this.socialApi.generateMockStats(cred.platform);
               }
           } catch (apiError: any) {
               this.logger.warn(`API Error for ${cred.platform}: ${apiError.message}. Using fallback stats.`);
               stats = this.socialApi.generateMockStats(cred.platform);
               pageName = settings.pageName || `${cred.platform} Business Page`;
           }
        } else {
           stats = this.socialApi.generateMockStats(cred.platform);
           pageName = `${cred.platform} Profile`;
        }
        
        const updatedSettings = { ...settings, analytics: stats, pageName, pictureUrl, followersCount };

        await this.prisma.socialCredential.update({
          where: { id: cred.id },
          data: { settings: updatedSettings }
        });

        results.push({ platform: cred.platform, pageName, ...stats });
      } catch (err) {
        this.logger.error(`Failed to sync ${cred.platform} for ${tenantId}`);
      }
    }

    return results;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyAnalyticsSync() {
    this.logger.log('Starting daily sync of social analytics for all tenants...');
    // Find all distinct tenants that have connected social credentials
    const credentials = await this.prisma.socialCredential.findMany({
      select: { tenantId: true },
      distinct: ['tenantId']
    });

    for (const cred of credentials) {
      try {
        await this.syncAnalytics(cred.tenantId);
        this.logger.log(`Daily sync completed for tenant: ${cred.tenantId}`);
      } catch (err) {
        this.logger.error(`Failed daily sync for tenant ${cred.tenantId}: ${err.message}`);
      }
    }
  }

  async createPost(tenantId: string, data: { platform: string, message: string, link?: string }) {
    const cred = await this.prisma.socialCredential.findUnique({
      where: { tenantId_platform: { tenantId, platform: data.platform.toUpperCase() } }
    });

    if (!cred) {
      throw new BadRequestException(`No credentials found for ${data.platform}`);
    }

    const settings = cred.settings as any || {};
    const pageAccessToken = settings.pageAccessToken;

    if (cred.platform === 'FACEBOOK') {
      if (!pageAccessToken) throw new BadRequestException('Page Access Token required for Facebook posting');
      try {
        const details = await this.socialApi.getFacebookPageDetails(pageAccessToken);
        const result = await this.socialApi.publishPost(cred.platform, { message: data.message, link: data.link }, pageAccessToken, details.id);
        return { success: true, postId: result.id };
      } catch (err) {
        this.logger.error(`Facebook Publish Error: ${err.message}`);
        throw new BadRequestException('Failed to publish post to Facebook. Verify your permissions.');
      }
    }

    // Mock for other platforms
    const result = await this.socialApi.publishPost(cred.platform, { message: data.message, link: data.link }, 'mock-token');
    return { success: true, postId: result.id };
  }

  async sendSocialMessage(data: { tenantId: string, platform: string, recipientId: string, text: string }) {
    const cred = await this.prisma.socialCredential.findUnique({
      where: { tenantId_platform: { tenantId: data.tenantId, platform: data.platform.toUpperCase() } }
    });

    if (!cred) throw new BadRequestException(`No ${data.platform} account connected`);
    
    const settings = cred.settings as any;
    if (!settings?.pageAccessToken) throw new BadRequestException('Missing page access token');

    let pageId = settings.pageId;
    if (!pageId) {
       const details = await this.socialApi.getFacebookPageDetails(settings.pageAccessToken);
       pageId = details.id;
    }

    return this.socialApi.sendDirectMessage(data.platform, { recipientId: data.recipientId, message: data.text }, settings.pageAccessToken, pageId);
  }

  async handleSocialMessage(platform: string, pageId: string, senderId: string, text: string) {
    const creds = await this.prisma.socialCredential.findMany({ where: { platform: platform.toUpperCase() } });
    let tenantId = null;
    let pageName = 'Facebook User';

    for (const cred of creds) {
      const settings = cred.settings as any;
      if (settings?.pageId === pageId || (cred.platform === 'FACEBOOK' && settings?.pageAccessToken)) {
         tenantId = cred.tenantId;
         break;
      }
    }

    if (!tenantId) {
      this.logger.warn(`No tenant found for pageId: ${pageId}`);
      return;
    }

    try {
      await axios.post('http://localhost:3004/api/v1/communications/conversations', {
        tenantId,
        platform,
        externalId: senderId,
        name: pageName,
        text
      });
      this.logger.log(`Forwarded incoming ${platform} message to communication service for tenant ${tenantId}`);
    } catch (err: any) {
      this.logger.error('Failed to forward message to communication service', err.message);
    }
  }

  async getCampaigns(tenantId: string) {
    if (!tenantId) return [];
    try {
      return await this.prisma.campaign.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      this.logger.error(`Failed to fetch campaigns for tenant ${tenantId}: ${err.message}`);
      return [];
    }
  }

  async createCampaign(tenantId: string, data: any) {
    return this.prisma.campaign.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        type: data.type,
        status: 'PENDING',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        templateId: data.templateId,
        leadIds: data.leadIds || [],
      },
    });
  }

  async getCampaign(id: string, tenantId: string) {
    return this.prisma.campaign.findFirst({
      where: { id, tenantId },
    });
  }

  async updateCampaign(id: string, tenantId: string, data: any) {
    return this.prisma.campaign.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        templateId: data.templateId,
        leadIds: data.leadIds,
      },
    });
  }

  async deleteCampaign(id: string, tenantId: string) {
    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  // ─── Campaign Background Processor ──────────────────────────
  @Cron(CronExpression.EVERY_MINUTE)
  async processCampaigns() {
    this.logger.debug('Checking for pending campaigns...');
    
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: new Date(),
        },
      },
      take: 5, // Process in small batches
    });

    for (const campaign of campaigns) {
      this.logger.log(`Starting campaign: ${campaign.name} (${campaign.id})`);
      
      await this.prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'RUNNING' },
      });

      try {
        if (campaign.type === 'EMAIL') {
          await this.processEmailCampaign(campaign);
        } else {
          // Handle other types (SMS, CALL) later
          await this.prisma.campaign.update({
            where: { id: campaign.id },
            data: { status: 'COMPLETED' },
          });
        }
      } catch (error) {
        this.logger.error(`Campaign ${campaign.id} failed: ${error.message}`);
        await this.prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'FAILED', errorMessage: error.message },
        });
      }
    }
  }

  private async processEmailCampaign(campaign: any) {
    const commsUrl = process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004';
    const crmUrl = process.env.CRM_SERVICE_URL || 'http://localhost:3003';
    
    let processed = 0;
    let failed = 0;

    // 1. Get Template
    let template;
    try {
      const { data } = await axios.get(`${commsUrl}/communications/templates/${campaign.templateId}`, {
        headers: { 'x-tenant-id': campaign.tenantId }
      });
      template = data;
    } catch (err) {
      throw new Error(`Template not found: ${campaign.templateId}`);
    }

    // 2. Process Leads
    for (const leadId of campaign.leadIds) {
      try {
        // Fetch lead details for personalization
        const { data: lead } = await axios.get(`${crmUrl}/contacts/${leadId}`, {
          headers: { 'x-tenant-id': campaign.tenantId }
        });

        const personalizedBody = template.content.replace(/{{name}}/g, `${lead.firstName} ${lead.lastName}`);
        const personalizedSubject = template.subject.replace(/{{name}}/g, lead.firstName);

        await axios.post(`${commsUrl}/communications/email`, {
          to: lead.email,
          subject: personalizedSubject,
          body: personalizedBody,
        }, {
          headers: { 'x-tenant-id': campaign.tenantId }
        });

        processed++;
      } catch (err) {
        failed++;
        this.logger.warn(`Failed to send email to lead ${leadId}: ${err.message}`);
      }

      // Update progress every few leads
      if (processed % 5 === 0) {
        await this.prisma.campaign.update({
          where: { id: campaign.id },
          data: { processedCount: processed, failedCount: failed },
        });
      }
    }

    await this.prisma.campaign.update({
      where: { id: campaign.id },
      data: { 
        status: 'COMPLETED', 
        processedCount: processed, 
        failedCount: failed 
      },
    });
  }
}
