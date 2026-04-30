import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { ImportProcessor } from './import.processor';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'import-queue',
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService, ImportProcessor],
  exports: [ImportService],
})
export class ImportModule {}
