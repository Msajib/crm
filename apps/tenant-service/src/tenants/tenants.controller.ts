import {
  Controller, Get, Post, Put, Patch, Body,
  Param, Query, Headers, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import {
  CreateTenantDto, UpdateTenantDto,
  ConnectSocialAccountDto, PaymentGatewayConfigDto,
  UpdateSystemSettingsDto
} from './dto/tenant.dto';

// Note: Auth is enforced at gateway level
// x-tenant-id and x-user-id are injected by API Gateway

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

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

  @Post(':id/payment-gateways')
  @ApiOperation({ summary: 'Configure payment gateway (Admin self-setup)' })
  async configurePayment(
    @Param('id') tenantId: string,
    @Body() dto: PaymentGatewayConfigDto,
  ) {
    return this.tenantsService.configurePaymentGateway(tenantId, dto);
  }

  @Get(':id/payment-gateways')
  @ApiOperation({ summary: 'Get configured payment gateways (credentials masked)' })
  async getPaymentGateways(@Param('id') tenantId: string) {
    return this.tenantsService.getPaymentGateways(tenantId);
  }
}
