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
      let duplicateCount = 0;
      const errorLog: any[] = [];

      const crmServiceUrl = process.env.CRM_SERVICE_URL || 'http://localhost:3003';
      const commServiceUrl = process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004';

      const mapping = job.data.mapping || {};
      const reversedMapping = Object.fromEntries(
        Object.entries(mapping).map(([k, v]) => [v, k])
      );

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // 1. Map row to Contact DTO dynamically
          const contactDto: any = {
            source: 'IMPORT',
            sourcePlatform: 'MANUAL',
            type: 'CONTACT',
            rawPayload: {}
          };

          // Use mapping if provided
          if (Object.keys(mapping).length > 0) {
            Object.entries(mapping).forEach(([csvHeader, crmField]) => {
              if (crmField && row[csvHeader] !== undefined) {
                contactDto[crmField as string] = row[csvHeader];
              }
            });

            // Merge unmapped columns into rawPayload
            Object.keys(row).forEach(key => {
              if (!mapping[key]) {
                contactDto.rawPayload[key] = row[key];
              }
            });
          } else {
            // Smart Fallback Mapping (Case insensitive & variations)
            const getVal = (possibleKeys: string[]) => {
              const key = Object.keys(row).find(k => 
                possibleKeys.map(pk => pk.toLowerCase()).includes(k.toLowerCase())
              );
              return key ? row[key] : '';
            };

            contactDto.firstName = getVal(['firstName', 'first_name', 'fname', 'first']);
            contactDto.lastName = getVal(['lastName', 'last_name', 'lname', 'last']);
            contactDto.email = getVal(['email', 'mail', 'e-mail']);
            contactDto.phone = getVal(['phone', 'mobile', 'cell', 'tel']);
            contactDto.company = getVal(['company', 'organization', 'business']);

            // Merge everything else into rawPayload
            const mappedKeys = ['firstName', 'lastName', 'email', 'phone', 'company'];
            Object.keys(row).forEach(key => {
               const isMapped = mappedKeys.some(mk => key.toLowerCase().includes(mk.toLowerCase()));
               if (!isMapped) {
                  contactDto.rawPayload[key] = row[key];
               }
            });
          }

          // 2. Validate mandatory email
          if (!contactDto.email) {
            throw new Error(`Missing email (checked headers: ${Object.keys(row).join(', ')})`);
          }

          // 3. ── Duplicate Detection ─────────────────────────────
          try {
            const queryParams: string[] = [];
            if (contactDto.email) queryParams.push(`email=${encodeURIComponent(contactDto.email)}`);
            if (contactDto.phone) queryParams.push(`phone=${encodeURIComponent(contactDto.phone)}`);

            if (queryParams.length > 0) {
              const checkUrl = `${crmServiceUrl}/contacts?${queryParams.join('&')}&limit=1`;
              const { data: existingResult } = await firstValueFrom(
                this.httpService.get(checkUrl, {
                  headers: { 'x-tenant-id': tenantId },
                }),
              );

              const existing = existingResult?.data || existingResult;
              const hasMatch = Array.isArray(existing) ? existing.length > 0
                : (existing?.total > 0 || existing?.contacts?.length > 0);

              if (hasMatch) {
                duplicateCount++;
                errorLog.push({
                  row: i + 1,
                  email: contactDto.email,
                  reason: 'DUPLICATE',
                  detail: `Contact with email ${contactDto.email} already exists`,
                });
                continue; 
              }
            }
          } catch (dupErr: any) {
            this.logger.warn(`Duplicate check failed for row ${i + 1}: ${dupErr.message}`);
          }

          // 4. Create contact in CRM Service
          await firstValueFrom(
            this.httpService.post(`${crmServiceUrl}/contacts/internal/import`, {
              ...contactDto,
              tenantId,
              userId,
            }),
          );

          successCount++;
        } catch (err: any) {
          failedCount++;
          errorLog.push({
            row: i + 1,
            email: row.email || row.Email || 'unknown',
            reason: err.response?.data?.message || err.message,
          });
        }

        if (i % 10 === 0 || i === data.length - 1) {
          await this.prisma.importJob.update({
            where: { id: jobId },
            data: {
              processedRows: i + 1,
              successRows: successCount,
              failedRows: failedCount + duplicateCount,
              errorLog: errorLog as any,
            },
          });
        }
      }

      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { status: 'COMPLETED' },
      });

      // 5. ── Send completion notification (in-app) ───────────────
      await this.sendCompletionNotification(tenantId, userId, {
        fileName: job.data.fileName,
        successCount,
        failedCount,
        duplicateCount,
        jobId,
      });

      // 6. ── Send summary email to uploader ─────────────────────
      await this.sendSummaryEmail(tenantId, userId, {
        fileName: job.data.fileName,
        successCount,
        failedCount,
        duplicateCount,
        totalRows: data.length,
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
        }),
      );
    } catch (e) {
      this.logger.error(`Failed to send import notification: ${e.message}`);
    }
  }

  private async sendSummaryEmail(tenantId: string, userId: string, stats: any) {
    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      const commServiceUrl = process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004';

      let uploaderEmail: string | null = null;
      try {
        const { data: user } = await firstValueFrom(
          this.httpService.get(`${authServiceUrl}/users/${userId}`, {
            headers: { 'x-tenant-id': tenantId },
          }),
        );
        uploaderEmail = user?.email || null;
      } catch (err) {
        this.logger.warn(`Could not fetch uploader email for userId ${userId}: ${err.message}`);
      }

      if (!uploaderEmail) return;

      const subject = `Import Complete: ${stats.fileName}`;
      const body = `
        <h2>Import Summary</h2>
        <p>Your file <strong>${stats.fileName}</strong> has been processed.</p>
        <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
          <tr><td><strong>Total Rows</strong></td><td>${stats.totalRows}</td></tr>
          <tr><td><strong>✅ Imported</strong></td><td>${stats.successCount}</td></tr>
          <tr><td><strong>⚠️ Duplicates Skipped</strong></td><td>${stats.duplicateCount}</td></tr>
          <tr><td><strong>❌ Failed</strong></td><td>${stats.failedCount}</td></tr>
        </table>
        <p>Job ID: <code>${stats.jobId}</code></p>
      `;

      await firstValueFrom(
        this.httpService.post(`${commServiceUrl}/communications/email`, {
          to: uploaderEmail,
          subject,
          body,
        }, {
          headers: { 'x-tenant-id': tenantId },
        }),
      );

      this.logger.log(`Import summary email sent to ${uploaderEmail}`);
    } catch (e) {
      this.logger.error(`Failed to send import summary email: ${e.message}`);
    }
  }
}
