import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'import-service',
      port: process.env.IMPORT_SERVICE_PORT || 3009,
      timestamp: new Date().toISOString(),
    };
  }
}
