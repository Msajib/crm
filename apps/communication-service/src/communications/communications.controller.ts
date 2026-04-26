import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';

@ApiTags('communications')
@Controller('communications')
@ApiBearerAuth()
export class CommunicationsController {
  constructor(private readonly commsService: CommunicationsService) {}

  @Post('email')
  @ApiOperation({ summary: 'Send an email' })
  async sendEmail(@Body() body: any, @Headers('x-tenant-id') tenantId: string) {
    return this.commsService.sendEmail(tenantId || 'system', body);
  }

  @Post('call')
  @ApiOperation({ summary: 'Log a call' })
  async logCall(@Body() body: any, @Headers('x-tenant-id') tenantId: string) {
    return this.commsService.logCall(tenantId || 'system', body);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get communication logs' })
  async getLogs(@Headers('x-tenant-id') tenantId: string) {
    return this.commsService.getLogs(tenantId || 'system');
  }
}
