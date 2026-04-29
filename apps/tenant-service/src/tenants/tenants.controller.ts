import {
  Controller, Get, Post, Put, Patch, Body,
  Param, Query, Headers, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import {
  CreateTenantDto, UpdateTenantDto,
  ConnectSocialAccountDto,
  UpdateSystemSettingsDto
} from './dto/tenant.dto';

// Note: Auth is enforced at gateway level
// x-tenant-id and x-user-id are injected by API Gateway

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant details' })
  async findCurrent(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId || tenantId === 'system') {
       return { name: 'System Admin', id: 'system' };
    }
    
    // Demo fallbacks for mock IDs
    if (tenantId === 't1') return { id: 't1', name: 'Acme Corp', slug: 'acme', plan: { name: 'PRO' } };
    if (tenantId === 't2') return { id: 't2', name: 'TechFlow', slug: 'techflow', plan: { name: 'ENTERPRISE' } };
    if (tenantId === 't3') return { id: 't3', name: 'Global Sol', slug: 'global', plan: { name: 'STARTER' } };

    try {
      return await this.tenantsService.findById(tenantId);
    } catch (e) {
      // Fallback for any other non-existent tenant in demo mode
      return { id: tenantId, name: 'Demo Workspace', slug: 'demo' };
    }
  }

  @Get('system/settings')
  @ApiOperation({ summary: 'Get global system settings' })
  async getSystemSettings() {
    return this.tenantsService.getSystemSettings();
  }

  @Put('system/settings')
  @ApiOperation({ summary: 'Update global system settings (Super Admin)' })
  async updateSystemSettings(@Body() dto: UpdateSystemSettingsDto) {
    return this.tenantsService.updateSystemSettings(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tenant (on admin registration)' })
  async create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateTenantDto,
  ) {
    return this.tenantsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tenants (Super Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.tenantsService.findAll(+page, +limit, search);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all available subscription plans' })
  async getPlans() {
    return this.tenantsService.getPlans();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant details' })
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tenant settings' })
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @Patch(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a tenant (Super Admin)' })
  async suspend(@Param('id') id: string) {
    return this.tenantsService.suspend(id);
  }

  @Post(':id/social-accounts')
  @ApiOperation({ summary: 'Connect social media account' })
  async connectSocial(
    @Param('id') tenantId: string,
    @Body() dto: ConnectSocialAccountDto,
  ) {
    return this.tenantsService.connectSocial(tenantId, dto);
  }

  @Patch(':id/branding')
  @ApiOperation({ summary: 'Update tenant branding' })
  async updateBranding(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    if (id === 'system') {
      // If it's the system account, update global settings instead
      return this.tenantsService.updateSystemSettings({
        systemName: dto.name,
        logoUrl: dto.logoUrl,
        faviconUrl: dto.faviconUrl,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        accentColor: dto.accentColor,
      });
    }
    return this.tenantsService.update(id, dto);
  }
}
