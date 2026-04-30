import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Increase payload limits for base64 image uploads
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .setTitle('CRM Tenant Service')
    .setDescription('Tenant & Plan Management Microservice')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.TENANT_SERVICE_PORT || 3002;
  await app.listen(port, '0.0.0.0');
  console.log(`🏢 Tenant Service running on: http://localhost:${port} `);
  console.log(`📚 Swagger: http://localhost:${port}/docs`);
}
bootstrap();
