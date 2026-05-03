import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { json, urlencoded } from 'express';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('VoiceService');

  // Security headers
  app.use((helmet as any).default ? (helmet as any).default() : (helmet as any)());

  // Payload limits
  app.use(json({ limit: '50mb' })); // larger for audio uploads
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  });

  app.setGlobalPrefix('api/v1');

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const config = new DocumentBuilder()
    .setTitle('Voice Service API')
    .setDescription('AI script generation, TTS audio, and Twilio outbound calling')
    .setVersion('1.0')
    .addTag('voice')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = parseInt(process.env.VOICE_SERVICE_PORT || process.env.PORT || '3011', 10);
  await app.listen(port);
  logger.log(`🎙️ Voice Service running on port ${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();

