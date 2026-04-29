import {
  Injectable, NotFoundException, ConflictException, ForbiddenException, Logger
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTenantDto, UpdateTenantDto,
  ConnectSocialAccountDto,
  UpdateSystemSettingsDto
} from './dto/tenant.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);
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
  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }
}
