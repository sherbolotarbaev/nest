import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  AuthModule,
  UsersModule,
  PrismaModule,
  JwtModule,
  SupabaseModule,
  UploadModule,
  OthersModule,
  ChatGptModule,
} from './modules';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';

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
    AuthModule,
    UsersModule,
    PrismaModule,
    JwtModule,
    SupabaseModule,
    UploadModule,
    OthersModule,
    ChatGptModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
