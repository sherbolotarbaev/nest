import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import moment from 'moment';

export const config = {
  supportsResponseStreaming: true,
};

async function start() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 888;
  const logger = new Logger('NestJsApplication');

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000', `${process.env.FRONTEND_BASE_URL}`],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.use(cookieParser());

  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: '10mb',
    }),
  );

  const time = moment().format('HH:mm:ss:ms');

  try {
    await app.listen(port);
    logger.log(`Server is running on: http://localhost:${port} ⚡️${time}`);
  } catch (e: any) {
    logger.error(e);
    process.exit(1);
  }
}
start();
