import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './common';
import { UsersService } from '../users/users.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: 60 * 30 }, // 30 minutes
    }),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
  ],
  providers: [AuthService, JwtStrategy, UsersService],
  controllers: [AuthController],
})
export class AuthModule {}
