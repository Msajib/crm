import { Controller, Get, Headers, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AppController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(@Headers('x-tenant-id') tenantId: string, @Query('tenantId') queryTenantId?: string) {
    console.log('Controller this:', this);
    return this.analyticsService.getDashboardKpis(tenantId || queryTenantId || 'system');
  }

  @Get('leads')
  async getLeads(@Headers('x-tenant-id') tenantId: string, @Query('tenantId') queryTenantId?: string) {
    return this.analyticsService.getLeadsAnalytics(tenantId || queryTenantId || 'system');
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'analytics-service',
      port: process.env.ANALYTICS_SERVICE_PORT || 3007,
      timestamp: new Date().toISOString(),
    };
  }
}
