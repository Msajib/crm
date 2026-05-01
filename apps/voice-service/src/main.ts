import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('VoiceService');

  app.enableCors();
  app.setGlobalPrefix('api/v1');

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploads as static files
  // NestExpressApplication is generic type for app
  const expressApp = app as any;

  const config = new DocumentBuilder()
    .setTitle('Voice Service API')
    .setDescription('AI script generation, TTS audio, and Twilio outbound calling')
    .setVersion('1.0')
    .addTag('voice')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = parseInt(process.env.PORT || '3011', 10);
  await app.listen(port);
  logger.log(`Voice Service running on port ${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
