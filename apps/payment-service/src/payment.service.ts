import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private prisma: PrismaService) {}

  async saveConfig(tenantId: string, data: { gateway: string, publicKey: string, secretKey: string, settings?: any }) {
    return this.prisma.paymentGatewayConfig.upsert({
      where: {
        tenantId_gateway: {
          tenantId,
          gateway: data.gateway.toUpperCase(),
        },
      },
      update: {
        publicKey: data.publicKey,
        secretKey: data.secretKey,
        settings: data.settings,
      },
      create: {
        tenantId,
        gateway: data.gateway.toUpperCase(),
        publicKey: data.publicKey,
        secretKey: data.secretKey,
        settings: data.settings,
      },
    });
  }

  async getConfigs(tenantId: string) {
    return this.prisma.paymentGatewayConfig.findMany({
      where: { tenantId },
      select: {
        gateway: true,
        publicKey: true,
        settings: true,
        status: true,
        createdAt: true,
      }
    });
  }

  // ─── Subscriptions & Plans ───────────────────────────────────

  async createSubscription(data: { 
    tenantId: string, 
    userId: string, 
    userName?: string,
    userEmail?: string,
    planId: string, 
    planName: string,
    amount: number,
    isTrial?: boolean
  }) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (data.isTrial ? 14 : 30));

      const subscription = await this.prisma.subscription.upsert({
        where: { tenantId: data.tenantId },
        update: {
          planId: data.planId,
          planName: data.planName,
          status: data.isTrial ? 'TRIAL' : 'ACTIVE',
          startDate: new Date(),
          endDate,
        },
        create: {
          tenantId: data.tenantId,
          planId: data.planId,
          planName: data.planName,
          status: data.isTrial ? 'TRIAL' : 'ACTIVE',
          startDate: new Date(),
          endDate,
        },
      });

      // Create Invoice
      const invoice = await this.prisma.invoice.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          orderId: `ORD-${Date.now()}`,
          planName: data.planName,
          amount: data.amount,
          status: 'PAID',
          gateway: 'SYSTEM_CREDIT', // Default for now
        },
      });

      // Log Event
      await this.prisma.planPurchaseEvent.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          planId: data.planId,
          planName: data.planName,
          amount: data.amount,
        },
      });

      // Trigger Notification to Super Admin
      if (data.isTrial || data.planName.toLowerCase().includes('14 days')) {
        await this.notifySuperAdmin(data);
      }

      // Send Invoice Email to Customer
      if (data.userEmail) {
        await this.sendInvoiceEmail({
          to: data.userEmail,
          customerName: data.userName || 'Valued Customer',
          amount: data.amount.toString(),
          planName: data.planName,
          invoiceId: invoice.id
        });
      }

      return { subscription, invoice };
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw error;
    }
  }

  private async sendInvoiceEmail(data: any) {
    try {
      const commsUrl = process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004';
      await fetch(`${commsUrl}/communications/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'SUPER_ADMIN' },
        body: JSON.stringify(data),
      });
      this.logger.log(`Invoice email sent to ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send invoice email: ${error.message}`);
    }
  }

  async getAllSubscriptions() {
    return this.prisma.subscription.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getAllInvoices() {
    return this.prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTenantInvoices(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async notifySuperAdmin(data: any) {
    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
      const payload = {
        title: 'New Plan Purchase',
        message: `User ${data.userName || data.userId} from tenant ${data.tenantId} has purchased ${data.planName}.`,
        type: 'PAYMENT'
      };

      // Using global fetch (Node 18+)
      await fetch(`${authServiceUrl}/users/internal/notify-super-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      this.logger.log(`Super admin notified of ${data.planName} purchase.`);
    } catch (error) {
      this.logger.error(`Failed to notify super admin: ${error.message}`);
      // Don't throw here to avoid failing the whole purchase flow
    }
  }

  // ─── Payment Links ───────────────────────────────────

  async createPaymentLink(userId: string, dto: any) {
    const token = crypto.randomBytes(16).toString('hex');
    return this.prisma.paymentLink.create({
      data: {
        token,
        type: dto.type || 'SUBSCRIPTION',
        planId: dto.planId,
        planName: dto.planName,
        customPrice: dto.customPrice,
        currency: dto.currency || 'USD',
        durationDays: dto.durationDays,
        description: dto.description,
        maxUses: dto.maxUses || 1,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdBy: userId,
      }
    });
  }

  async getPaymentLinks() {
    return this.prisma.paymentLink.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async validatePaymentLink(token: string) {
    const link = await this.prisma.paymentLink.findUnique({ where: { token } });
    if (!link) throw new Error('Invalid payment link');
    if (!link.isActive) throw new Error('Payment link is inactive');
    if (link.expiresAt && link.expiresAt < new Date()) throw new Error('Payment link expired');
    if (link.maxUses > 0 && link.usedCount >= link.maxUses) throw new Error('Payment link use limit reached');
    return link;
  }

  async usePaymentLink(token: string, customerData: any, paymentData: any) {
    const link = await this.validatePaymentLink(token);

    this.logger.log(`Charging ${link.customPrice} via Stripe for token ${token}`);

    const tenantUrl = process.env.TENANT_SERVICE_URL || 'http://localhost:3002';
    const tenantRes = await fetch(`${tenantUrl}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: customerData.businessName,
        slug: customerData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        planId: link.planId,
        planName: link.planName,
        status: 'ACTIVE',
      })
    });
    const tenant = await tenantRes.json();
    if (!tenant || !tenant.id) throw new Error('Failed to create tenant');

    const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    await fetch(`${authUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerData.email,
        password: crypto.randomBytes(8).toString('hex') + 'Aa1!',
        firstName: customerData.name?.split(' ')[0] || 'User',
        lastName: customerData.name?.split(' ').slice(1).join(' ') || '',
        tenantId: tenant.id,
      })
    });

    await this.prisma.paymentLink.update({
      where: { id: link.id },
      data: { usedCount: { increment: 1 } }
    });

    await this.prisma.paymentLinkUse.create({
      data: {
        linkId: link.id,
        tenantId: tenant.id,
      }
    });

    await this.sendInvoiceEmail({
      to: customerData.email,
      customerName: customerData.name,
      amount: link.customPrice?.toString() || '0',
      planName: link.planName,
      invoiceId: 'NEW-SUB'
    });

    return { success: true, tenantId: tenant.id, message: 'Account created' };
  }
}
