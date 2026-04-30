import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as csv from 'csv-parse/sync';
import * as xlsx from 'xlsx';

@Processor('import-queue')
export class ImportProcessor extends WorkerHost {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { jobId, tenantId, userId, fileBuffer, fileType } = job.data;
    this.logger.log(`Processing import job ${jobId} for tenant ${tenantId}`);

    await this.prisma.importJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });

    try {
      let data: any[] = [];
      const buffer = Buffer.from(fileBuffer);

      if (fileType.includes('csv')) {
        data = csv.parse(buffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
      } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      }

      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { totalRows: data.length },
      });

      let successCount = 0;
      let failedCount = 0;
      const errorLog: any[] = [];

      const crmServiceUrl = process.env.CRM_SERVICE_URL || 'http://localhost:3003';

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // 1. Validate mandatory fields
          if (!row.email) {
             throw new Error('Missing email');
          }

          // 2. Map row to Contact DTO
          const contactDto = {
            firstName: row.firstName || row.first_name || '',
            lastName: row.lastName || row.last_name || '',
            email: row.email,
            phone: row.phone || row.mobile || '',
            company: row.company || '',
            source: 'IMPORT',
            type: 'CONTACT',
          };

          // 3. Create contact in CRM Service
          // The CRM service should handle duplicate check if we provide tenantId
          await firstValueFrom(
            this.httpService.post(`${crmServiceUrl}/contacts/internal/import`, {
              ...contactDto,
              tenantId,
              userId,
            })
          );

          successCount++;
        } catch (err: any) {
          failedCount++;
          errorLog.push({
            row: i + 1,
            data: row,
            reason: err.response?.data?.message || err.message,
          });
        }

        // Update progress every 10 rows
        if (i % 10 === 0 || i === data.length - 1) {
          await this.prisma.importJob.update({
            where: { id: jobId },
            data: { 
              processedRows: i + 1,
              successRows: successCount,
              failedRows: failedCount,
              errorLog: errorLog as any,
            },
          });
        }
      }

      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { status: 'COMPLETED' },
      });

      // 4. Send Notification
      await this.sendCompletionNotification(tenantId, userId, {
        fileName: job.data.fileName,
        successCount,
        failedCount,
        jobId,
      });

    } catch (error) {
      this.logger.error(`Import job ${jobId} failed: ${error.message}`);
      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', errorLog: { error: error.message } as any },
      });
    }
  }

  private async sendCompletionNotification(tenantId: string, userId: string, stats: any) {
    try {
      const commServiceUrl = process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004';
      await firstValueFrom(
        this.httpService.post(`${commServiceUrl}/notifications/internal/import-complete`, {
          tenantId,
          userId,
          stats,
        })
      );
    } catch (e) {
      this.logger.error(`Failed to send notification: ${e.message}`);
    }
  }
}
