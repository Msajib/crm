import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommunicationsService {
  constructor(private prisma: PrismaService) {}

  async sendEmail(tenantId: string, data: { to: string, subject: string, body: string }) {
    return this.prisma.emailLog.create({
      data: {
        tenantId,
        from: 'system@crm.local',
        ...data
      }
    });
  }

  async logCall(tenantId: string, data: { to: string, duration: number, status: string }) {
    return this.prisma.callLog.create({
      data: {
        tenantId,
        from: 'system',
        ...data
      }
    });
  }

  async getLogs(tenantId: string) {
    const emails = await this.prisma.emailLog.findMany({ where: { tenantId }, take: 10, orderBy: { createdAt: 'desc' } });
    const calls = await this.prisma.callLog.findMany({ where: { tenantId }, take: 10, orderBy: { createdAt: 'desc' } });
    return { emails, calls };
  }
}
