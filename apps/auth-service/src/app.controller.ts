import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'auth-service',
      port: process.env.AUTH_SERVICE_PORT || 3001,
      timestamp: new Date().toISOString(),
    };
  }
}
