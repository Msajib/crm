import { Controller, Post, Get, Body, Query, Headers, Logger, HttpCode, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { Public } from '../marketing/public.decorator'; // I'll create this or use a bypass

@ApiTags('webhooks')
@Controller('social/webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    @Inject(MarketingService)
    private readonly marketingService: MarketingService
  ) {}

  // ─── FACEBOOK WEBHOOK VERIFICATION ──────────────────────────
  @Get('facebook')
  verifyFacebook(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
    this.logger.log(`Verifying Facebook Webhook: ${mode}`);
    // In production, compare token with a stored VERIFY_TOKEN
    return challenge;
  }

  // ─── FACEBOOK WEBHOOK PAYLOAD ───────────────────────────────
  @Post('facebook')
  @HttpCode(200)
  async handleFacebookWebhook(@Body() body: any) {
    this.logger.log('Received Facebook Webhook Payload');
    
    // Facebook Lead Ads structure:
    // { entry: [{ changes: [{ field: 'leadgen', value: { leadgen_id: '...', page_id: '...' } }] }] }
    
    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value.leadgen_id;
          const pageId = change.value.page_id;
          this.logger.log(`New Lead detected: ${leadgenId} for Page: ${pageId}`);
          
          await this.marketingService.processSocialLead('FACEBOOK', {
            leadgenId,
            pageId,
            rawData: change.value
          });
        }
      }

      const messaging = entry.messaging || [];
      for (const msg of messaging) {
        if (msg.message && msg.message.text && !msg.message.is_echo) {
          const senderId = msg.sender.id;
          const recipientId = msg.recipient.id;
          const text = msg.message.text;
          
          this.logger.log(`New Message detected from: ${senderId} to Page: ${recipientId}`);
          await this.marketingService.handleSocialMessage('FACEBOOK', recipientId, senderId, text);
        }
      }
    }
    
    return { status: 'processed' };
  }

  // ─── LINKEDIN WEBHOOK ──────────────────────────────────────
  @Post('linkedin')
  @HttpCode(200)
  async handleLinkedInWebhook(@Body() body: any) {
    this.logger.log('Received LinkedIn Webhook Payload');
    // Implementation for LinkedIn Lead Gen Forms
    return { status: 'processed' };
  }
}
