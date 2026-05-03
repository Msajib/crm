import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'crm-service',
      port: process.env.CRM_SERVICE_PORT || 3003,
      timestamp: new Date().toISOString(),
    };
  }
}
