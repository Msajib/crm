import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';
import { EmailSenderService } from './email-sender.service';
import { TemplatesService } from './templates.service';

@Module({
  imports: [PrismaModule],
  controllers: [CommunicationsController],
  providers: [CommunicationsService, EmailSenderService, TemplatesService],
  exports: [CommunicationsService, EmailSenderService, TemplatesService],
})
export class CommunicationsModule {}
