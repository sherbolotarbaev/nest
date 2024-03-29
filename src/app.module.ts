import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import {
  AuthModule,
  UsersModule,
  PrismaModule,
  JwtModule,
  SupabaseModule,
  UploadModule,
  OthersModule,
  ChatGptModule,
  ChatModule,
} from './modules';

import { CacheModule } from '@nestjs/cache-manager';
import { MailerModule } from '@nestjs-modules/mailer';

// import { AppController } from './app.controller';

import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        port: 587,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    JwtModule,
    SupabaseModule,
    UploadModule,
    OthersModule,
    ChatGptModule,
    ChatModule,
  ],
  // controllers: [AppController],
})
export class AppModule {}
