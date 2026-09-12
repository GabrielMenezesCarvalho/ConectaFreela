import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from './app.module';

// Os scripts via npm workspace executam com cwd em apps/api. Carrega o .env da
// raiz no desenvolvimento local; no Docker, as variáveis chegam pelo ambiente.
const localEnvPath = resolve(process.cwd(), '../../.env');
if (existsSync(localEnvPath)) process.loadEnvFile(localEnvPath);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.enableCors({ origin: process.env.WEB_URL ?? 'http://localhost:3000' });
  await app.listen(process.env.PORT ?? 3333);
}
void bootstrap();
