import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import bodyParser from 'body-parser';

async function start() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('NestApplication');

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: process.env.FRONTEND_BASE_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  await app.listen(process.env.PORT);
  logger.log(`Server is running on: http://localhost:${process.env.PORT} ⚡️`);
}

start();
