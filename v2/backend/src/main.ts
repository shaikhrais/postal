import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
  app.setGlobalPrefix('api/v2');
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Nest backend listening on http://localhost:${port}/api/v2`);
}

bootstrap();
