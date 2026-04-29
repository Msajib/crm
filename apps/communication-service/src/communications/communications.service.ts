import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailSenderService } from './email-sender.service';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

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
}
