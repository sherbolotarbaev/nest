import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import bodyParser from 'body-parser';

async function start() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 888;
  const logger = new Logger('NestApplication');

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

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
