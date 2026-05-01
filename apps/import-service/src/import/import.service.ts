import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ImportProcessor } from './import.processor';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectQueue('import-queue') private importQueue: Queue,
    private prisma: PrismaService,
    private importProcessor: ImportProcessor,
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

    // Add to BullMQ queue with a timeout check
    try {
      await Promise.race([
        this.importQueue.add('process-contacts', {
          jobId: job.id,
          tenantId,
          userId,
          fileBuffer: file.buffer,
          fileType: file.mimetype,
          fileName: file.originalname,
        }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 2000))
      ]);
      this.logger.log(`Job ${job.id} added to background queue`);
    } catch (err) {
      this.logger.warn(`Redis unavailable. Processing import ${job.id} synchronously...`);
      // Sync Fallback
      setTimeout(() => {
        this.importProcessor.process({
          data: {
            jobId: job.id,
            tenantId,
            userId,
            fileBuffer: file.buffer,
            fileType: file.mimetype,
            fileName: file.originalname,
          }
        } as any).catch(e => this.logger.error(`Sync import failed: ${e.message}`));
      }, 100);
    }

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
