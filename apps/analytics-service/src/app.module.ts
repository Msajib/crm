import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AnalyticsService, PrismaService],
})
export class AppModule {}
