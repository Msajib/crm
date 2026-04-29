import { Module } from '@nestjs/common';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';
import { WebhookController } from './webhook.controller';
import { SocialApiService } from './social-api.service';

@Module({
  controllers: [MarketingController, WebhookController],
  providers: [MarketingService, SocialApiService],
})
export class MarketingModule {}
