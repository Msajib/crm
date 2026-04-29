import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PaymentService } from './payment.service';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [AppController],
  providers: [PaymentService, PrismaService],
})
export class AppModule {}
