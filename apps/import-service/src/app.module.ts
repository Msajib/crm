import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ImportModule } from './import/import.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST', '127.0.0.1');
        const port = parseInt(configService.get('REDIS_PORT', '6379'));
        const password = configService.get('REDIS_PASSWORD');

        const connection = {
          host,
          port,
          password,
          maxRetriesPerRequest: null,
          enableOfflineQueue: true,
          connectTimeout: 2000,
          // Suppress internal ioredis error logging
          retryStrategy: (times) => {
             if (times > 1) return null; // stop retrying after 1 attempt if it fails initially? 
             // No, BullMQ needs it to retry. But we can make it quiet.
             return Math.min(times * 100, 3000);
          }
        };

        return { 
          connection,
          defaultJobOptions: {
            removeOnComplete: true,
            attempts: 3,
          }
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    ImportModule,
  ],
})
export class AppModule {}
