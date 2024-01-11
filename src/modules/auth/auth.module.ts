import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies';
import { UsersService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: 60 * 30 }, // 30 minutes
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    UsersService,
    JwtService,
    PrismaService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
