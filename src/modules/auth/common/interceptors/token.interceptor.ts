import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JwtService } from '../../../jwt/jwt.service';

import { COOKIE_MAX_AGE } from '..';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<User>,
  ): Observable<Promise<User>> {
    return next.handle().pipe(
      map(async (user) => {
        const response = context.switchToHttp().getResponse<Response>();
        const token = await this.jwtService.generateToken(user.id);

        response.setHeader('Authorization', `Bearer ${token}`);
        response.cookie('token', token, {
          httpOnly: true,
          signed: true,
          sameSite: 'none',
          secure: process.env.NODE_ENV === 'production',
          maxAge: COOKIE_MAX_AGE,
        });

        delete user.password;
        delete user.resetPasswordToken;
        delete user.verificationToken;

        return user;
      }),
    );
  }
}
