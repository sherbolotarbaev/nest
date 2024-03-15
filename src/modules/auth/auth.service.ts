import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { UsersService } from '../users/users.service';
import { compare, hash } from '../../utils/bcrypt';
import { JwtService } from '../jwt/jwt.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';

import {
  LoginDto,
  RegisterDto,
  EditMeDto,
  EmailVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';

import { GoogleUser } from '../auth/common/interface';

import { getLocation } from '../../utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async googleOAuthValidate({
    firstName,
    lastName,
    photo,
    email,
  }: GoogleUser): Promise<User | { error: boolean; status: number }> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      if (!existingUser.isVerified || !existingUser.verificationToken) {
        this.sendVerificationCode(
          existingUser.id,
          existingUser.email,
          existingUser.firstName,
        );
      }

      if (!existingUser.isActive) {
        return { error: true, status: 403 };
      }

      try {
        return existingUser;
      } catch (e: any) {
        console.error(e);
        throw new Error(e.message);
      }
    }

    const user = await this.usersService.createUser({
      firstName,
      lastName,
      email,
      password: 'google-oauth',
      photo,
    });

    this.sendVerificationCode(user.id, user.email, user.firstName);

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser(dto);

    this.sendVerificationCode(user.id, user.email, user.firstName);

    try {
      return user;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async login({ emailOrUsername, password }: LoginDto) {
    const user = await this.usersService.findByEmailOrUsername(emailOrUsername);
    const comparedPassword = await compare(password, user.password);

    if (!comparedPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    if (!user.isVerified || !user.verificationToken) {
      this.sendVerificationCode(user.id, user.email, user.firstName);
    }

    try {
      return user;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getMe(request: Request, user: User) {
    const ip =
      request.headers['x-real-ip'] ||
      request.headers['x-forwarded-for'] ||
      request.socket.remoteAddress ||
      '';

    const ipAddress = Array.isArray(ip) ? ip[0] : ip;
    const location = await getLocation(ipAddress);

    this.setMetaData(user.id, ipAddress, location);

    delete user.password;
    delete user.resetPasswordToken;
    delete user.verificationToken;

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async editMe(user: User, { firstName, lastName, username }: EditMeDto) {
    if (username && username !== user.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: {
          username: username.toLowerCase(),
        },
      });

      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName,
        lastName,
        username: username ? username.toLowerCase() : user.username,
      },
    });

    try {
      return updatedUser;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async emailVerification(user: User, { code }: EmailVerificationDto) {
    if (user.isVerified) {
      throw new BadRequestException('User has already been verified');
    }

    const comparedCode = await compare(code, user.verificationToken);

    if (!comparedCode) {
      throw new ConflictException(`Code doesn't match`);
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
      },
    });

    try {
      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(email);

    const identificationToken = await this.jwt.generateResetPasswordToken(
      user.id,
    );
    const forgotLink = `${process.env.AUTH_APP_URL}/password/reset?identification_token=${identificationToken}`;

    await Promise.all([
      this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          resetPasswordToken: identificationToken,
        },
      }),
      this.mailerService.sendMail({
        to: user.email,
        from: process.env.MAILER_USER,
        subject: 'Password reset',
        html: `
            <h2>Hey ${user.firstName}</h2>
            <p>To recover your password, please use this <a target="_self" href="${forgotLink}">link</a>.</p>
        `,
      }),
    ]);

    try {
      return {
        message: `Password reset link has been sent to ${user.email}`,
      };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async resetPassword({ password, identificationToken }: ResetPasswordDto) {
    const compare = await this.jwt.compareResetPasswordToken(
      identificationToken,
    );
    const userId = compare.id;
    const hashedPassword = await hash(password);

    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    try {
      return {
        message: 'Your password has been successfully updated',
      };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  private async generateVerificationCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  private async sendVerificationCode(
    userId: number,
    userEmail: string,
    userName: string,
  ) {
    const code = await this.generateVerificationCode();
    const verificationToken = await hash(code);

    await Promise.all([
      this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          verificationToken,
        },
      }),
      this.mailerService.sendMail({
        to: userEmail,
        from: process.env.MAILER_USER,
        subject: 'Verification Code',
        html: `
            <h2>Hey ${userName}</h2>
            <p>Your verification code is <strong style="color:blue">${code}</strong>.</p>
        `,
      }),
    ]);
  }

  private async setMetaData(
    userId: number,
    ip: string,
    location: LocationData,
  ) {
    await this.prisma.userMetaData.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        ip,
        ...location,
        lastVisit: new Date(),
      },
      update: {
        ip,
        ...location,
        lastVisit: new Date(),
      },
    });
  }
}
