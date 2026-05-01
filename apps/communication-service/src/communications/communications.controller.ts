import { Controller, Post, Get, Put, Delete, Body, Headers, Param, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';
import { TemplatesService } from './templates.service';

@ApiTags('communications')
@Controller('communications')
@ApiBearerAuth()
export class CommunicationsController {
  private readonly logger = new Logger(CommunicationsController.name);

  constructor(
    private readonly commsService: CommunicationsService,
    private readonly templatesService: TemplatesService,
  ) {}

  // ─── Templates ──────────────────────────────────────────────
  @Post('templates')
  @ApiOperation({ summary: 'Create email template' })
  async createTemplate(@Headers('x-tenant-id') tenantId: string, @Body() dto: any) {
    return this.templatesService.create(tenantId, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List all email templates' })
  async listTemplates(@Headers('x-tenant-id') tenantId: string) {
    return this.templatesService.findAll(tenantId);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template details' })
  async getTemplate(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.templatesService.findOne(id, tenantId);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update template' })
  async updateTemplate(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: any
  ) {
    return this.templatesService.update(id, tenantId, dto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete template' })
  async deleteTemplate(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.templatesService.remove(id, tenantId);
  }

  @Post('email')
  @ApiOperation({ summary: 'Send an email' })
  async sendEmail(@Body() body: any, @Headers('x-tenant-id') tenantId: string) {
    return this.commsService.sendEmail(tenantId, body);
  }

  @Post('call')
  @ApiOperation({ summary: 'Log a call' })
  async logCall(@Body() body: any, @Headers('x-tenant-id') tenantId: string) {
    return this.commsService.logCall(tenantId, body);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get communication logs' })
  async getLogs(@Headers('x-tenant-id') tenantId: string) {
    return this.commsService.getLogs(tenantId);
  }

  @Post('email-config')
  @ApiOperation({ summary: 'Save email configuration' })
  async saveEmailConfig(@Headers('x-tenant-id') tenantId: string, @Body() data: any) {
    return this.commsService.saveEmailConfig(tenantId, data);
  }

  @Get('email-config')
  @ApiOperation({ summary: 'Get email configuration' })
  async getEmailConfig(@Headers('x-tenant-id') tenantId: string) {
    return this.commsService.getEmailConfig(tenantId);
  }

  @Post('invoice')
  @ApiOperation({ summary: 'Send an invoice email with PDF attachment' })
  async sendInvoice(@Headers('x-tenant-id') tenantId: string, @Body() data: any) {
    return this.commsService.sendInvoice(tenantId, data);
  }

  @Post('notify')
  @ApiOperation({ summary: 'Send a notification' })
  async notify(@Headers('x-tenant-id') tenantId: string, @Body() data: any) {
    return this.commsService.notify(tenantId, data);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get notifications' })
  async getNotifications(@Headers('x-tenant-id') tenantId: string) {
    return this.commsService.getNotifications(tenantId);
  }

  @Post('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Headers('x-tenant-id') tenantId: string, @Body('id') id: string) {
    return this.commsService.markAsRead(id, tenantId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  async getConversations(@Headers('x-tenant-id') tenantId: string) {
    return this.commsService.getConversations(tenantId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  async getMessages(@Headers('x-tenant-id') tenantId: string, @Param('id') conversationId: string) {
    return this.commsService.getMessages(tenantId, conversationId);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Handle incoming message from webhook' })
  async handleIncomingMessage(@Body() body: any) {
    return this.commsService.handleIncomingMessage(body);
  }

  @Post('conversations/:id/reply')
  @ApiOperation({ summary: 'Reply to a conversation' })
  async replyToConversation(@Headers('x-tenant-id') tenantId: string, @Param('id') conversationId: string, @Body() body: { text: string }) {
    return this.commsService.replyToConversation(tenantId, { conversationId, text: body.text });
  }

  @Post('conversations/:id/notes')
  @ApiOperation({ summary: 'Update conversation notes' })
  async updateNotes(@Headers('x-tenant-id') tenantId: string, @Param('id') conversationId: string, @Body() body: { notes: string }) {
    return this.commsService.updateConversationNotes(tenantId, conversationId, body.notes);
  }

  @Post('notifications/internal/send-email')
  @ApiOperation({ summary: 'Internal: Send email (called by other services)' })
  async internalSendEmail(@Body() body: any) {
    const { tenantId, to, subject, message } = body;
    return this.commsService.sendEmail(tenantId, { to, subject, body: message });
  }

  @Post('notifications/internal/import-complete')
  @ApiOperation({ summary: 'Internal: Import completion notification' })
  async internalImportComplete(@Body() body: any) {
    const { tenantId, userId, stats } = body;
    return this.commsService.notify(tenantId, {
      title: 'Import Completed',
      message: `Your import of ${stats.fileName} is finished. ${stats.successCount} success, ${stats.failedCount} failed.`,
      type: 'IMPORT_COMPLETE',
    });
  }

  // ─── SMS ────────────────────────────────────────────────────

  @Post('sms')
  @ApiOperation({ summary: 'Send a single SMS via Twilio' })
  async sendSms(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { to: string; message: string },
  ) {
    return this.commsService.sendSms(tenantId, body.to, body.message);
  }

  // ─── WHATSAPP ───────────────────────────────────────────────

  @Post('whatsapp')
  @ApiOperation({ summary: 'Send a WhatsApp template message via Meta Cloud API' })
  async sendWhatsApp(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { to: string; templateName: string; params?: string[] },
  ) {
    return this.commsService.sendWhatsApp(tenantId, body.to, body.templateName, body.params || []);
  }

  // ─── BULK ────────────────────────────────────────────────────

  @Post('bulk-email')
  @ApiOperation({ summary: 'Send bulk emails (used by campaign processor)' })
  async bulkEmail(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { messages: Array<{ to: string; subject: string; body: string }> },
  ) {
    return this.commsService.bulkEmail(tenantId, body.messages);
  }

  @Post('bulk-sms')
  @ApiOperation({ summary: 'Send bulk SMS messages (used by campaign processor)' })
  async bulkSms(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { messages: Array<{ to: string; body: string }> },
  ) {
    return this.commsService.bulkSms(tenantId, body.messages);
  }

  @Post('bulk-whatsapp')
  @ApiOperation({ summary: 'Send bulk WhatsApp messages (used by campaign processor)' })
  async bulkWhatsApp(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { messages: Array<{ to: string; templateName: string; params?: string[] }> },
  ) {
    return this.commsService.bulkWhatsApp(tenantId, body.messages);
  }
}

