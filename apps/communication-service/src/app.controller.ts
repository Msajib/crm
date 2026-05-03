import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'communication-service is active and running.';
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'communication-service',
      port: process.env.COMMUNICATION_SERVICE_PORT || 3004,
      timestamp: new Date().toISOString(),
    };
  }
}

