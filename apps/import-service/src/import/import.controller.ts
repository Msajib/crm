import {
  Controller, Get, Post, Param, UseInterceptors, UploadedFile, Headers, UseGuards, Request
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { ImportService } from './import.service';

@ApiTags('import')
@ApiBearerAuth()
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('contacts')
  @ApiOperation({ summary: 'Upload contacts for bulk import' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importContacts(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.importService.createImportJob(tenantId, userId, file);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get import history' })
  async getHistory(@Headers('x-tenant-id') tenantId: string) {
    return this.importService.getImportHistory(tenantId);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get job status' })
  async getStatus(
    @Param('id') jobId: string,
    @Headers('x-tenant-id') tenantId: string
  ) {
    return this.importService.getJobStatus(jobId, tenantId);
  }

  @Get(':id/report')
  @ApiOperation({ summary: 'Get job report' })
  async getReport(
    @Param('id') jobId: string,
    @Headers('x-tenant-id') tenantId: string
  ) {
    return this.importService.getJobReport(jobId, tenantId);
  }
}
