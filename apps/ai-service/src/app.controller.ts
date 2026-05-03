import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'ai-service',
      port: process.env.AI_SERVICE_PORT || 3008,
      timestamp: new Date().toISOString(),
    };
  }
}
