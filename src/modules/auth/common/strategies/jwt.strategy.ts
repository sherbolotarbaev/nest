import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';

import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';

import { UsersService } from '../../../users/users.service';
import { JwtPayload } from '../interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const authorizationHeader = request.headers.authorization;
          const cookieToken = request.signedCookies['token'];

          if (authorizationHeader && authorizationHeader.startsWith('Bearer')) {
            return authorizationHeader.slice(7);
          }

          return cookieToken;
        },
      ]),
      ignoreExpiration: false,
      passReqToCallback: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    };

    super(options);
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.id) {
      throw new UnauthorizedException();
    }

    const userId = parseInt(payload.id);
    return await this.usersService.findById(userId);
  }
}
