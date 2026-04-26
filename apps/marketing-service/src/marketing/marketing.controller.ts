import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';

@ApiTags('marketing')
@Controller()
@ApiBearerAuth()
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post('social/connect')
  @ApiOperation({ summary: 'Connect social account' })
  async connectSocial(@Body() body: any, @Headers('x-tenant-id') tenantId: string) {
    return this.marketingService.connectSocial(tenantId || 'system', body);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get all campaigns' })
  async getCampaigns(@Headers('x-tenant-id') tenantId: string) {
    return this.marketingService.getCampaigns(tenantId || 'system');
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create a campaign' })
  async createCampaign(@Body() body: any, @Headers('x-tenant-id') tenantId: string) {
    return this.marketingService.createCampaign(tenantId || 'system', body);
  }
}
