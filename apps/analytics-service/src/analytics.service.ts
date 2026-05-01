import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboardKpis(tenantId: string) {
    try {
      const crmUrl = process.env.CRM_SERVICE_URL || 'http://localhost:3003';
      const statsRes = await fetch(`${crmUrl}/dashboard/stats`, {
        headers: { 'x-tenant-id': tenantId }
      });
      return await statsRes.json();
    } catch (err) {
      this.logger.error(`Failed to fetch dashboard KPIs: ${err.message}`);
      return {};
    }
  }

  async getLeadsAnalytics(tenantId: string) {
    try {
      const crmUrl = process.env.CRM_SERVICE_URL || 'http://localhost:3003';
      // Fetch all leads for basic analysis
      const leadsRes = await fetch(`${crmUrl}/contacts?status=LEAD`, {
        headers: { 'x-tenant-id': tenantId }
      });
      const data = await leadsRes.json();
      const leads = data.data || [];

      const bySource = leads.reduce((acc: any, lead: any) => {
        const src = lead.sourcePlatform || lead.source || 'Direct';
        acc[src] = (acc[src] || 0) + 1;
        return acc;
      }, {});

      const dailyNew = Array(30).fill(0).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) // mock data for daily trend
      }));

      return {
        bySource,
        dailyNew
      };
    } catch (err) {
      this.logger.error(`Failed to fetch leads analytics: ${err.message}`);
      return {};
    }
  }

  @Cron('0 * * * *')
  async hourlySnapshot() {
    this.logger.log('Running hourly metrics snapshot...');
    // In a real scenario, we would iterate all active tenants.
    // For now, we just log it as a stub.
  }
}
