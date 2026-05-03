import {
  Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, Headers, UseGuards, Request, Body, BadRequestException, NotFoundException
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
    @Body('mapping') mapping?: string, // JSON string if from multipart
  ) {
    if (!tenantId) throw new BadRequestException('Missing x-tenant-id header');
    const mappingObj = mapping ? JSON.parse(mapping) : null;
    return this.importService.createImportJob(tenantId, userId, file, mappingObj);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze file for mapping preview' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.importService.analyzeFile(file);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get import history' })
  async getHistory(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) return [];
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete import job' })
  async deleteJob(
    @Param('id') jobId: string,
    @Headers('x-tenant-id') tenantId: string
  ) {
    return this.importService.deleteImportJob(jobId, tenantId);
  }
}
