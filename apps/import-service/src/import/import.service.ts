import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ImportProcessor } from './import.processor';
import * as csv from 'csv-parse/sync';
import * as xlsx from 'xlsx';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectQueue('import-queue') private importQueue: Queue,
    private prisma: PrismaService,
    private importProcessor: ImportProcessor,
  ) {}

  async createImportJob(tenantId: string, userId: string, file: any, mapping?: any) {
    const job = await this.prisma.importJob.create({
      data: {
        tenantId,
        userId,
        fileName: file.originalname,
        fileSize: file.size,
        status: 'PENDING',
        mapping: mapping || {},
      },
    });

    // Fallback: process directly without Redis
    const isSmallFile = file.size < 5 * 1024 * 1024; // 5MB
    if (isSmallFile) {
      this.logger.log(`Processing small import (${(file.size/1024).toFixed(1)}KB) ${job.id} synchronously...`);
      // Run async without blocking the response
      setTimeout(() => {
        this.importProcessor.process({
          data: {
            jobId: job.id,
            tenantId,
            userId,
            fileBuffer: file.buffer,
            fileType: file.mimetype,
            fileName: file.originalname,
            mapping: mapping || {},
          }
        } as any).catch(e => this.logger.error(`Sync import failed: ${e.message}`));
      }, 100);
    } else {
      this.logger.error(`File too large (${(file.size/1024/1024).toFixed(1)}MB) for sync processing without Redis. Job ${job.id} failed.`);
      await this.prisma.importJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', errorLog: { error: 'Redis connection required for files > 5MB.' } as any },
      });
    }

    return job;
  }

  async analyzeFile(file: any) {
    if (!file) throw new BadRequestException('No file uploaded');

    try {
      let data: any[] = [];
      const buffer = Buffer.from(file.buffer);

      if (file.mimetype.includes('csv')) {
        data = csv.parse(buffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
      } else if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel')) {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      } else {
        throw new BadRequestException('Unsupported file type');
      }

      if (data.length === 0) throw new BadRequestException('File is empty');

      const headers = Object.keys(data[0]);
      const preview = data.slice(0, 5);

      return {
        headers,
        preview,
        totalRows: data.length,
      };
    } catch (err) {
      this.logger.error(`File analysis failed: ${err.message}`, err.stack);
      throw new BadRequestException(`Failed to parse file (${file.mimetype}): ${err.message}`);
    }
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

  async deleteImportJob(jobId: string, tenantId: string) {
    const job = await this.prisma.importJob.findFirst({
      where: { id: jobId, tenantId },
    });

    if (!job) throw new NotFoundException('Import job not found');
    
    await this.prisma.importJob.delete({
      where: { id: jobId },
    });
    
    return { success: true };
  }
}
