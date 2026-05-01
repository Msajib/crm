import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailSenderService } from './email-sender.service';
import axios from 'axios';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);
  private readonly credentialServiceUrl = process.env.CREDENTIAL_SERVICE_URL || 'http://localhost:3010';

  constructor(
    private prisma: PrismaService,
    private emailSender: EmailSenderService,
  ) {}

  async sendEmail(tenantId: string, data: { to: string, subject: string, body: string, isSystem?: boolean }) {
    // 1. Determine which config to use
    // If it's a system email (like purchase), use 'SUPER_ADMIN' config
    const targetTenantId = data.isSystem ? 'SUPER_ADMIN' : tenantId;
    
    const config = await this.prisma.emailConfig.findUnique({ 
      where: { tenantId: targetTenantId } 
    });

    if (!config) {
      if (data.isSystem) {
        this.logger.error('Super Admin email configuration missing! Please configure it in Settings.');
      } else {
        throw new BadRequestException('Email service not configured. Please set up your SMTP or API credentials in Settings.');
      }
      return;
    }

    // 2. Send real email
    try {
      await this.emailSender.sendEmail(config, {
        to: data.to,
        subject: data.subject,
        html: data.body,
      });

      // 3. Log the email
      return this.prisma.emailLog.create({
        data: {
          tenantId,
          from: config.fromEmail,
          to: data.to,
          subject: data.subject,
          body: data.body,
          status: 'SENT',
        }
      });
    } catch (err) {
      await this.prisma.emailLog.create({
        data: {
          tenantId,
          from: config?.fromEmail || 'unknown',
          to: data.to,
          subject: data.subject,
          body: data.body,
          status: 'FAILED',
        }
      });
      throw err;
    }
  }

  async sendInvoice(tenantId: string, data: { to: string, customerName: string, amount: string, planName: string, invoiceId: string }) {
    const config = await this.prisma.emailConfig.findUnique({ 
      where: { tenantId: 'SUPER_ADMIN' } 
    });

    if (!config) {
      this.logger.error('Super Admin email configuration missing for invoice delivery.');
      return;
    }

    const pdfBuffer = await this.emailSender.generateInvoicePdf(data);

    await this.emailSender.sendEmail(config, {
      to: data.to,
      subject: `Invoice for your ${data.planName} Subscription`,
      html: `
        <h1>Thank you for your purchase!</h1>
        <p>Hi ${data.customerName},</p>
        <p>Please find attached your invoice for the <strong>${data.planName}</strong> plan.</p>
        <p><strong>Amount:</strong> $${data.amount}</p>
        <p>Best regards,<br/>The Antigravity Team</p>
      `,
      attachments: [
        {
          filename: `invoice_${data.invoiceId}.pdf`,
          content: pdfBuffer,
        }
      ]
    });
  }

  async logCall(tenantId: string, data: { to: string, duration: number, status: string }) {
    return this.prisma.callLog.create({
      data: {
        tenantId,
        from: 'system',
        ...data
      }
    });
  }

  async getLogs(tenantId: string) {
    const emails = await this.prisma.emailLog.findMany({ where: { tenantId }, take: 10, orderBy: { createdAt: 'desc' } });
    const calls = await this.prisma.callLog.findMany({ where: { tenantId }, take: 10, orderBy: { createdAt: 'desc' } });
    return { emails, calls };
  }

  async saveEmailConfig(tenantId: string, data: any) {
    return this.prisma.emailConfig.upsert({
      where: { tenantId },
      update: data,
      create: { ...data, tenantId },
    });
  }

  async getEmailConfig(tenantId: string) {
    return this.prisma.emailConfig.findUnique({ where: { tenantId } });
  }

  // ─── NOTIFICATIONS ─────────────────────────────────────────

  async notify(tenantId: string, data: { type: string, title: string, message: string }) {
    return this.prisma.notification.create({
      data: {
        tenantId,
        type: data.type,
        title: data.title,
        message: data.message,
      }
    });
  }

  async getNotifications(tenantId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { 
        tenantId,
        ...(unreadOnly ? { read: false } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async markAsRead(id: string, tenantId: string) {
    return this.prisma.notification.updateMany({
      where: { id, tenantId },
      data: { read: true }
    });
  }

  // ─── CONVERSATIONS / MESSAGES ──────────────────────────────────
  async getConversations(tenantId: string) {
    return this.prisma.conversation.findMany({
      where: { tenantId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getMessages(tenantId: string, conversationId: string) {
     return this.prisma.message.findMany({
       where: { conversationId, conversation: { tenantId } },
       orderBy: { createdAt: 'asc' }
     });
  }

  async handleIncomingMessage(data: { tenantId: string, platform: string, externalId: string, name: string, text: string }) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { tenantId: data.tenantId, externalId: data.externalId, platform: data.platform }
    });

    let convId = conversation?.id;

    if (!conversation) {
      const newConv = await this.prisma.conversation.create({
        data: {
          tenantId: data.tenantId,
          platform: data.platform,
          externalId: data.externalId,
          name: data.name,
          lastMessage: data.text,
          unreadCount: 1,
        }
      });
      convId = newConv.id;
    } else {
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessage: data.text,
          unreadCount: { increment: 1 },
          updatedAt: new Date()
        }
      });
    }

    return this.prisma.message.create({
      data: {
        conversationId: convId,
        text: data.text,
        isFromCustomer: true
      }
    });
  }

  async replyToConversation(tenantId: string, data: { conversationId: string, text: string }) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: data.conversationId }
    });

    if (!conversation || conversation.tenantId !== tenantId) {
      throw new BadRequestException('Conversation not found');
    }

    try {
      const axios = require('axios');
      await axios.post('http://localhost:3005/api/v1/marketing/social/send-message', {
        tenantId,
        platform: conversation.platform,
        recipientId: conversation.externalId,
        text: data.text
      });
    } catch (err: any) {
      this.logger.error('Failed to dispatch message to marketing service', err.message);
      throw new BadRequestException('Failed to dispatch message: ' + (err.response?.data?.message || err.message));
    }

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: data.text,
        unreadCount: 0,
        updatedAt: new Date()
      }
    });

    return this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        text: data.text,
        isFromCustomer: false,
        senderId: 'admin'
      }
    });
  }

  async updateConversationNotes(tenantId: string, conversationId: string, notes: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId, tenantId },
      data: { notes }
    });
  }

  // ─── PRIVATE HELPERS ───────────────────────────────────────

  private async getDecryptedCredential(tenantId: string, type: string): Promise<any> {
    try {
      const { data } = await axios.get(
        `${this.credentialServiceUrl}/credentials/reveal/${type}`,
        { headers: { 'x-tenant-id': tenantId } },
      );
      return data.credentials;
    } catch (err) {
      this.logger.error(`Failed to fetch ${type} credential for tenant ${tenantId}: ${err.message}`);
      throw new BadRequestException(`${type} credentials not configured. Please add them in Settings > Integrations.`);
    }
  }

  // ─── SMS ────────────────────────────────────────────────────

  async sendSms(tenantId: string, to: string, body: string) {
    const creds = await this.getDecryptedCredential(tenantId, 'SMS');
    const { accountSid, authToken, fromNumber } = creds;

    if (!accountSid || !authToken || !fromNumber) {
      throw new BadRequestException('Incomplete SMS credentials (accountSid, authToken, fromNumber required).');
    }

    let status = 'SENT';
    let twilioMessageSid: string | null = null;

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const params = new URLSearchParams({ To: to, From: fromNumber, Body: body });
      const { data } = await axios.post(url, params.toString(), {
        auth: { username: accountSid, password: authToken },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      twilioMessageSid = data.sid;
      status = 'SENT';
      this.logger.log(`SMS sent to ${to} via Twilio. SID: ${data.sid}`);
    } catch (err) {
      status = 'FAILED';
      this.logger.error(`Twilio SMS failed to ${to}: ${err.response?.data?.message || err.message}`);
    }

    return this.prisma.smsLog.create({
      data: {
        tenantId,
        from: fromNumber,
        to,
        body,
        status,
        provider: 'TWILIO',
      },
    });
  }

  // ─── WHATSAPP ───────────────────────────────────────────────

  async sendWhatsApp(tenantId: string, to: string, templateName: string, params: string[] = []) {
    const creds = await this.getDecryptedCredential(tenantId, 'WHATSAPP');
    const { accessToken, phoneNumberId } = creds;

    if (!accessToken || !phoneNumberId) {
      throw new BadRequestException('Incomplete WhatsApp credentials (accessToken, phoneNumberId required).');
    }

    const components = params.length > 0 ? [{
      type: 'body',
      parameters: params.map((p) => ({ type: 'text', text: p })),
    }] : [];

    let status = 'SENT';
    let messageId: string | null = null;
    // Build the message body string for logging
    const bodyText = `[Template: ${templateName}] ${params.join(', ')}`;

    try {
      const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
      const { data } = await axios.post(url, {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en_US' },
          components,
        },
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      messageId = data.messages?.[0]?.id || null;
      status = 'SENT';
      this.logger.log(`WhatsApp message sent to ${to}. Message ID: ${messageId}`);
    } catch (err) {
      status = 'FAILED';
      this.logger.error(`WhatsApp send failed to ${to}: ${err.response?.data?.error?.message || err.message}`);
    }

    return this.prisma.whatsAppLog.create({
      data: {
        tenantId,
        to,
        body: bodyText,
        templateName,
        status,
        messageId,
      },
    });
  }

  // ─── BULK METHODS ───────────────────────────────────────────

  async bulkEmail(tenantId: string, messages: Array<{ to: string; subject: string; body: string }>) {
    let sent = 0;
    let failed = 0;
    for (const msg of messages) {
      try {
        await this.sendEmail(tenantId, msg);
        sent++;
      } catch (err) {
        failed++;
        this.logger.warn(`Bulk email failed to ${msg.to}: ${err.message}`);
      }
    }
    this.logger.log(`Bulk email done for tenant ${tenantId}: sent=${sent}, failed=${failed}`);
    return { sent, failed };
  }

  async bulkSms(tenantId: string, messages: Array<{ to: string; body: string }>) {
    let sent = 0;
    let failed = 0;
    for (const msg of messages) {
      try {
        await this.sendSms(tenantId, msg.to, msg.body);
        sent++;
      } catch (err) {
        failed++;
        this.logger.warn(`Bulk SMS failed to ${msg.to}: ${err.message}`);
      }
    }
    this.logger.log(`Bulk SMS done for tenant ${tenantId}: sent=${sent}, failed=${failed}`);
    return { sent, failed };
  }

  async bulkWhatsApp(tenantId: string, messages: Array<{ to: string; templateName: string; params?: string[] }>) {
    let sent = 0;
    let failed = 0;
    for (const msg of messages) {
      try {
        await this.sendWhatsApp(tenantId, msg.to, msg.templateName, msg.params || []);
        sent++;
      } catch (err) {
        failed++;
        this.logger.warn(`Bulk WhatsApp failed to ${msg.to}: ${err.message}`);
      }
    }
    this.logger.log(`Bulk WhatsApp done for tenant ${tenantId}: sent=${sent}, failed=${failed}`);
    return { sent, failed };
  }
}
