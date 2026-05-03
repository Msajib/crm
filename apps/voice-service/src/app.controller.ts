import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'voice-service',
      port: process.env.VOICE_SERVICE_PORT || 3011,
      timestamp: new Date().toISOString(),
    };
  }
}
