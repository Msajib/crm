import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VoiceModule } from './voice/voice.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    VoiceModule,
  ],
})
export class AppModule {}
