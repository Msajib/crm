import { Controller, Post, Get, Put, Delete, Body, Headers, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';

@ApiTags('marketing')
@Controller('marketing')
@ApiBearerAuth()
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  // ─── Campaigns ──────────────────────────────────────────────
  @Get('campaigns')
  @ApiOperation({ summary: 'List all campaigns' })
  async listCampaigns(@Headers() headers: any) {
    const tenantId = headers['x-tenant-id'];
    return this.marketingService.getCampaigns(tenantId);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create a new campaign' })
  async createCampaign(@Headers() headers: any, @Body() dto: any) {
    const tenantId = headers['x-tenant-id'];
    return this.marketingService.createCampaign(tenantId, dto);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get campaign details' })
  async getCampaign(@Headers() headers: any, @Param('id') id: string) {
    const tenantId = headers['x-tenant-id'];
    return this.marketingService.getCampaign(id, tenantId);
  }

  @Put('campaigns/:id')
  @ApiOperation({ summary: 'Update campaign' })
  async updateCampaign(
    @Headers() headers: any,
    @Param('id') id: string,
    @Body() dto: any
  ) {
    const tenantId = headers['x-tenant-id'];
    return this.marketingService.updateCampaign(id, tenantId, dto);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete campaign' })
  async deleteCampaign(@Headers() headers: any, @Param('id') id: string) {
    const tenantId = headers['x-tenant-id'];
    return this.marketingService.deleteCampaign(id, tenantId);
  }

  @Post('social/connect')
  @ApiOperation({ summary: 'Connect social account' })
  async connectSocial(@Body() body: any, @Headers('x-tenant-id') tenantId: string) {
    return this.marketingService.connectSocial(tenantId, body);
  }

  @Post('social/config')
  @ApiOperation({ summary: 'Save social app credentials' })
  async saveConfig(@Body() body: any, @Headers('x-tenant-id') tenantId: string) {
    return this.marketingService.saveConfig(tenantId, body);
  }

  @Get('social/configs')
  @ApiOperation({ summary: 'Get social app configurations' })
  async getConfigs(@Headers('x-tenant-id') tenantId: string) {
    return this.marketingService.getConfigs(tenantId);
  }

  @Post('social/sync')
  @ApiOperation({ summary: 'Sync social analytics' })
  async syncSocial(@Headers('x-tenant-id') tenantId: string) {
    return this.marketingService.syncAnalytics(tenantId);
  }

  @Post('social/post')
  @ApiOperation({ summary: 'Publish a social post' })
  async publishPost(@Body() body: any, @Headers('x-tenant-id') tenantId: string) {
    return this.marketingService.createPost(tenantId, body);
  }

  @Post('social/send-message')
  @ApiOperation({ summary: 'Send direct message via social platform' })
  async sendSocialMessage(@Body() body: any) {
    return this.marketingService.sendSocialMessage(body);
  }
}
