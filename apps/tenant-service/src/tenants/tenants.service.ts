import {
  Injectable, NotFoundException, ConflictException, ForbiddenException, Logger
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTenantDto, UpdateTenantDto,
  ConnectSocialAccountDto,
  UpdateSystemSettingsDto,
  UpdateExpiryTemplatesDto
} from './dto/tenant.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService
  ) {}

  // ─── Create Tenant ────────────────────────────────────────────
  async create(ownerId: string, dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug already taken');

    // Get starter plan by default
    const plan = await this.prisma.plan.findFirst({
      where: { tier: 'STARTER' },
    });

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        ownerId,
        planId: plan?.id || 'default-plan-id',
        timezone: dto.timezone || 'UTC',
        locale: dto.locale || 'en',
      },
      include: { plan: true },
    });

    return tenant;
  }

  // ─── Get Tenant ───────────────────────────────────────────────
  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        plan: true,
        socialAccounts: {
          select: {
            id: true, platform: true, accountName: true, isActive: true, connectedAt: true,
          },
        },
      },
    });
    
    if (!tenant) {
      return this.createDefaultTenant(id);
    }
    
    return tenant;
  }

  private async createDefaultTenant(id: string) {
    this.logger.log(`Tenant ${id} not found. Creating a default record.`);
    
    // Get an existing plan to avoid foreign key violations
    let plan = await this.prisma.plan.findFirst({
      where: { tier: 'STARTER' },
    });

    if (!plan) {
      plan = await this.prisma.plan.findFirst();
    }

    if (!plan) {
      // Create a plan if none exists - highly unlikely in prod but good for dev
      plan = await this.prisma.plan.create({
        data: {
          name: 'Starter',
          tier: 'STARTER',
          price: 0,
        }
      });
    }

    return this.prisma.tenant.create({
      data: {
        id,
        name: 'Demo Workspace',
        slug: `demo-${id.toLowerCase().substring(0, 8)}-${Math.random().toString(36).substring(7)}`,
        ownerId: 'system',
        planId: plan.id
      },
      include: { plan: true }
    });
  }

  async update(id: string, dto: UpdateTenantDto) {
    try {
      this.logger.log(`Updating tenant ${id} with data: ${JSON.stringify(dto)}`);
      let tenant = await this.prisma.tenant.findUnique({ where: { id } });
      
      if (!tenant) {
        this.logger.log(`Tenant ${id} not found in DB. Attempting lazy creation...`);
        tenant = await this.createDefaultTenant(id);
      }

      const updated = await this.prisma.tenant.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.timezone && { timezone: dto.timezone }),
          ...(dto.locale && { locale: dto.locale }),
          ...(dto.logoUrl && { logoUrl: dto.logoUrl }),
          ...(dto.faviconUrl && { faviconUrl: dto.faviconUrl }),
          ...(dto.primaryColor && { primaryColor: dto.primaryColor }),
          ...(dto.secondaryColor && { secondaryColor: dto.secondaryColor }),
          ...(dto.accentColor && { accentColor: dto.accentColor }),
          ...(dto.customDomain && { customDomain: dto.customDomain }),
        },
        include: { plan: true },
      });
      this.logger.log(`Successfully updated tenant ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update tenant ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ─── System Settings (Super Admin) ───────────────────────────
  async getSystemSettings() {
    let settings = await this.prisma.systemSetting.findUnique({
      where: { id: 'global' },
    });

    if (!settings) {
      settings = await this.prisma.systemSetting.create({
        data: { id: 'global' },
      });
    }

    return settings;
  }

  async updateSystemSettings(dto: UpdateSystemSettingsDto) {
    return this.prisma.systemSetting.upsert({
      where: { id: 'global' },
      update: {
        ...(dto.systemName && { systemName: dto.systemName }),
        ...(dto.logoUrl && { logoUrl: dto.logoUrl }),
        ...(dto.faviconUrl && { faviconUrl: dto.faviconUrl }),
        ...(dto.primaryColor && { primaryColor: dto.primaryColor }),
        ...(dto.secondaryColor && { secondaryColor: dto.secondaryColor }),
        ...(dto.accentColor && { accentColor: dto.accentColor }),
        ...(dto.metaDescription && { metaDescription: dto.metaDescription }),
      },
      create: {
        id: 'global',
        ...dto,
      },
    });
  }

  // ─── All Tenants (Super Admin) ────────────────────────────────
  async findAll(page = 1, limit = 20, search?: string) {
    const where: any = {
      slug: { not: 'system' }
    };
    if (search) {
      where.AND = [
        { slug: { not: 'system' } },
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ]
        }
      ];
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { plan: true },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { data: tenants, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ─── Suspend Tenant (Super Admin) ────────────────────────────
  async suspend(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }

  // ─── Connect Social Account ───────────────────────────────────
  async connectSocial(tenantId: string, dto: ConnectSocialAccountDto) {
    return this.prisma.socialAccount.upsert({
      where: { tenantId_platform: { tenantId, platform: dto.platform as any } },
      create: {
        tenantId,
        platform: dto.platform as any,
        accountName: dto.accountName,
        accountId: dto.accountId,
        accessToken: dto.accessToken, // In prod: encrypt this
        refreshToken: dto.refreshToken,
      },
      update: {
        accountName: dto.accountName,
        accountId: dto.accountId,
        accessToken: dto.accessToken,
        refreshToken: dto.refreshToken,
        isActive: true,
      },
    });
  }

  // ─── Get Plans ────────────────────────────────────────────────
  // ─── Extend Subscription (Super Admin) ───────────────────────
  async extendSubscription(id: string, days: number) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const currentExpiry = tenant.expiresAt || new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + days);

    return this.prisma.tenant.update({
      where: { id },
      data: { expiresAt: newExpiry, status: 'ACTIVE' },
    });
  }

  // ─── System Templates (Super Admin) ───────────────────────────
  async createTemplate(dto: any) {
    return this.prisma.systemTemplate.create({ data: dto });
  }

  async findAllTemplates() {
    const templates = await this.prisma.systemTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Add virtual templates for expiry if they aren't there
    const settings = await this.getSystemSettings();
    
    const expiryWarning = {
      id: 'system-expiry-warning',
      name: 'Subscription Expiry (3 Days Before)',
      subject: 'Action Required: Your subscription expires in 3 days',
      content: settings.expiryWarningTemplate || 'Hello {{user_name}}, your subscription for {{tenant_name}} expires in 3 days. Upgrade here: {{upgrade_link}}',
      isSystem: true,
      category: 'SUBSCRIPTION',
      updatedAt: settings.updatedAt
    };
    
    const expiryFinal = {
      id: 'system-expiry-final',
      name: 'Subscription Expired (End Date)',
      subject: 'Your subscription has expired',
      content: settings.expiryFinalTemplate || 'Hello {{user_name}}, your subscription for {{tenant_name}} has expired. Renew now: {{upgrade_link}}',
      isSystem: true,
      category: 'SUBSCRIPTION',
      updatedAt: settings.updatedAt
    };
    
    return [expiryWarning, expiryFinal, ...templates];
  }

  async updateTemplate(id: string, dto: any) {
    if (id === 'system-expiry-warning') {
      return this.updateExpiryTemplates({ expiryWarningTemplate: dto.content });
    }
    if (id === 'system-expiry-final') {
      return this.updateExpiryTemplates({ expiryFinalTemplate: dto.content });
    }
    return this.prisma.systemTemplate.update({
      where: { id },
      data: dto
    });
  }

  async deleteTemplate(id: string) {
    return this.prisma.systemTemplate.delete({ where: { id } });
  }

  // ─── Expiry Templates (Super Admin) ──────────────────────────
  async updateExpiryTemplates(dto: UpdateExpiryTemplatesDto) {
    return this.prisma.systemSetting.upsert({
      where: { id: 'global' },
      update: {
        expiryWarningTemplate: dto.expiryWarningTemplate,
        expiryFinalTemplate: dto.expiryFinalTemplate,
      },
      create: {
        id: 'global',
        expiryWarningTemplate: dto.expiryWarningTemplate,
        expiryFinalTemplate: dto.expiryFinalTemplate,
      },
    });
  }

  // ─── Expiry Notifications Scheduler ──────────────────────────
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiryNotifications() {
    this.logger.log('Running subscription expiry check...');
    
    const settings = await this.getSystemSettings();
    const now = new Date();
    
    // Check for 3 days before
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);
    const threeDaysLaterEnd = new Date(threeDaysLater);
    threeDaysLaterEnd.setHours(23, 59, 59, 999);
    
    const warningTenants = await this.prisma.tenant.findMany({
      where: {
        expiresAt: {
          gte: threeDaysLater,
          lte: threeDaysLaterEnd
        },
        status: 'ACTIVE'
      }
    });

    for (const tenant of warningTenants) {
      this.logger.log(`Sending 3-day expiry warning to tenant ${tenant.slug}`);
      await this.sendExpiryEmail(tenant, settings.expiryWarningTemplate || 'Your subscription expires in 3 days. Please renew to avoid service interruption.');
    }

    // Check for today
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const expiredTenants = await this.prisma.tenant.findMany({
      where: {
        expiresAt: {
          gte: now,
          lte: todayEnd
        },
        status: 'ACTIVE'
      }
    });

    for (const tenant of expiredTenants) {
      this.logger.log(`Sending final expiry notice to tenant ${tenant.slug}`);
      await this.sendExpiryEmail(tenant, settings.expiryFinalTemplate || 'Your subscription has expired. Service will be restricted.');
      // Optionally update status to SUSPENDED here if you want immediate cutoff
      // await this.prisma.tenant.update({ where: { id: tenant.id }, data: { status: 'SUSPENDED' } });
    }
  }

  private async sendExpiryEmail(tenant: any, template: string) {
    try {
      const commServiceUrl = process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004';
      const adminEmail = (tenant.settings as any)?.adminEmail || 'admin@' + tenant.slug + '.com';
      const adminName = (tenant.settings as any)?.adminName || 'Valued Client';
      const adminPhone = (tenant.settings as any)?.adminPhone || 'N/A';
      
      const appUrl = process.env.APP_URL || 'http://localhost:3100';
      const upgradeLink = `${appUrl}/subscribe/${tenant.id}`;

      // Replace placeholders
      let message = template
        .replace(/{{user_name}}/g, adminName)
        .replace(/{{user_email}}/g, adminEmail)
        .replace(/{{user_phone}}/g, adminPhone)
        .replace(/{{tenant_name}}/g, tenant.name)
        .replace(/{{upgrade_link}}/g, upgradeLink);

      await firstValueFrom(
        this.httpService.post(`${commServiceUrl}/notifications/internal/send-email`, {
          to: adminEmail,
          subject: 'Subscription Expiry Notification',
          message: message,
          tenantId: tenant.id
        })
      );
    } catch (e) {
      this.logger.error(`Failed to send expiry email for ${tenant.slug}: ${e.message}`);
    }
  }

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }
}
