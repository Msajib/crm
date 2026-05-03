import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { GatewayController } from './gateway/gateway.controller';
import { ProxyService } from './proxy/proxy.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TenantResolutionMiddleware } from './middleware/tenant-resolution.middleware';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true, 
      envFilePath: '.env',
      validationSchema: Joi.object({
        API_GATEWAY_PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().required(),
      })
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback_secret',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [GatewayController],
  providers: [
    ProxyService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    consumer.apply(TenantResolutionMiddleware).forRoutes('*');
  }
}
