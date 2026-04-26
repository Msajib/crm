import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  async connectSocial(tenantId: string, data: { platform: string, externalId: string, accessToken: string }) {
    return this.prisma.socialAccount.create({
      data: {
        tenantId,
        ...data
      }
    });
  }

  async getCampaigns(tenantId: string) {
    return this.prisma.campaign.findMany({ where: { tenantId } });
  }

  async createCampaign(tenantId: string, data: { name: string, type: string }) {
    return this.prisma.campaign.create({
      data: {
        tenantId,
        status: 'DRAFT',
        ...data
      }
    });
  }
}
