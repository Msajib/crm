import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS if needed (the gateway usually handles this, but good for direct testing)
  app.enableCors();
  
  const port = process.env.PORT || 3010;
  await app.listen(port);
  console.log(`Credential Service is running on port ${port}`);
}
bootstrap();
