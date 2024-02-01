import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

async function start() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 888;

  const logger = new Logger('NestApplication');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.use(cookieParser());

  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  try {
    await app.listen(port);
    logger.log(`Server is running on: http://localhost:${port} ⚡️`);
  } catch (e: any) {
    console.error(e);
    process.exit(1);
  }
}
start();
