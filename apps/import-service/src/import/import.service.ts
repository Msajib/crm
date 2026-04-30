import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectQueue('import-queue') private importQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async createImportJob(tenantId: string, userId: string, file: any) {
    const job = await this.prisma.importJob.create({
      data: {
        tenantId,
        userId,
        fileName: file.originalname,
        fileSize: file.size,
        status: 'PENDING',
      },
    });

    // Add to BullMQ queue
    await this.importQueue.add('process-contacts', {
      jobId: job.id,
      tenantId,
      userId,
      fileBuffer: file.buffer, // Note: In prod, upload to S3 first
      fileType: file.mimetype,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    return job;
  }

  async getJobStatus(jobId: string, tenantId: string) {
    const job = await this.prisma.importJob.findFirst({
      where: { id: jobId, tenantId },
    });

    if (!job) throw new NotFoundException('Import job not found');
    return job;
  }

  async getImportHistory(tenantId: string) {
    return this.prisma.importJob.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getJobReport(jobId: string, tenantId: string) {
    const job = await this.prisma.importJob.findFirst({
      where: { id: jobId, tenantId },
    });

    if (!job) throw new NotFoundException('Import job not found');
    return {
      status: job.status,
      total: job.totalRows,
      success: job.successRows,
      failed: job.failedRows,
      errors: job.errorLog,
    };
  }
}
