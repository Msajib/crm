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
        const connection = {
          host: configService.get('REDIS_HOST', '127.0.0.1'),
          port: parseInt(configService.get('REDIS_PORT', '6379')),
          password: configService.get('REDIS_PASSWORD'),
        };
        console.log(`[ImportService] Connecting to Redis at ${connection.host}:${connection.port} (Password: ${connection.password ? 'Yes' : 'No'})`);
        return { connection };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    ImportModule,
  ],
})
export class AppModule {}
