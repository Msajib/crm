import {
  Injectable, NotFoundException, ConflictException, ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTenantDto, UpdateTenantDto,
  ConnectSocialAccountDto, PaymentGatewayConfigDto,
  UpdateSystemSettingsDto
} from './dto/tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

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

    // Create initial subscription
    if (plan) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14); // 14-day trial

      await this.prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
          renewsAt: endDate,
        },
      });
    }

    return tenant;
  }

  // ─── Get Tenant ───────────────────────────────────────────────
  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        plan: true,
        subscription: true,
        socialAccounts: {
          select: {
            id: true, platform: true, accountName: true, isActive: true, connectedAt: true,
          },
        },
        paymentGateways: {
          select: {
            id: true, gateway: true, isActive: true, isDefault: true, currencies: true,
          },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  // ─── Update Tenant ────────────────────────────────────────────
  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    return this.prisma.tenant.update({
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
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { plan: true, subscription: true },
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

  // ─── Configure Payment Gateway ────────────────────────────────
  async configurePaymentGateway(tenantId: string, dto: PaymentGatewayConfigDto) {
    return this.prisma.paymentGatewayConfig.upsert({
      where: { tenantId_gateway: { tenantId, gateway: dto.gateway } },
      create: {
        tenantId,
        gateway: dto.gateway,
        credentials: dto.credentials, // In prod: encrypt this
        currencies: dto.currencies || [],
        isDefault: dto.isDefault || false,
      },
      update: {
        credentials: dto.credentials,
        currencies: dto.currencies || [],
        isDefault: dto.isDefault || false,
        isActive: true,
      },
    });
  }

  // ─── Get Payment Gateways (masked) ───────────────────────────
  async getPaymentGateways(tenantId: string) {
    const gateways = await this.prisma.paymentGatewayConfig.findMany({
      where: { tenantId },
      select: {
        id: true, gateway: true, isActive: true,
        isDefault: true, currencies: true, createdAt: true,
        // Do NOT return raw credentials
      },
    });
    return gateways;
  }

  // ─── Get Plans ────────────────────────────────────────────────
  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }
}
