import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VoiceModule } from './voice/voice.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    VoiceModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
