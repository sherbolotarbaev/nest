import { Injectable, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

import { GoogleUser } from '../interface';

import { AuthService } from '../../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile;

    const user: GoogleUser = {
      firstName: `${name.givenName}`,
      lastName: `${name.familyName}`,
      photo: photos[0].value,
      email: emails[0].value,
    };

    const validate = await this.authService.googleOAuthValidate(user);

    if ('error' in validate) {
      if (validate.status === 403) {
        return done(new ForbiddenException('User has been deactivated'));
      }
    }

    done(null, validate as User);
  }
}
