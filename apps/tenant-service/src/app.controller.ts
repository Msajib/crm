import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'tenant-service',
      port: process.env.TENANT_SERVICE_PORT || 3002,
      timestamp: new Date().toISOString(),
    };
  }
}
