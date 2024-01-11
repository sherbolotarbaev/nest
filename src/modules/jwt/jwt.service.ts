import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtSignOptions, JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService extends NestJwtService {
  constructor() {
    super();
  }

  async generateToken(userId: number): Promise<string> {
    return this.signAsync(
      { id: userId } as object,
      {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: 60 * 30, // 30 minutes
      } as JwtSignOptions,
    );
  }

  async generateResetPasswordSecret(userId: number): Promise<string> {
    const token = await this.signAsync({ id: userId }, {
      secret: process.env.JWT_RESET_PASSWORD_SECRET,
      expiresIn: 60 * 2, // 2 minutes
    } as JwtSignOptions);

    return token;
  }

  async compareResetPasswordSecret(token: string) {
    try {
      const decoded = await this.verifyAsync(token, {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
      });

      return decoded;
    } catch (e: any) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'The reset password link has expired. Please click the link below to reset your password again.',
        );
      } else {
        throw new UnauthorizedException(
          'Invalid reset password token. Please use the link provided to reset your password.',
        );
      }
    }
  }
}
