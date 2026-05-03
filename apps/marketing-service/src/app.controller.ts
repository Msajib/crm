import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'marketing-service is active and running.';
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'marketing-service',
      port: process.env.MARKETING_SERVICE_PORT || 3005,
      timestamp: new Date().toISOString(),
    };
  }
}

