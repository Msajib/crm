import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'credential-service',
      port: process.env.CREDENTIAL_SERVICE_PORT || 3010,
      timestamp: new Date().toISOString(),
    };
  }
}
