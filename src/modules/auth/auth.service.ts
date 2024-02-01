import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  LoginDto,
  RegisterDto,
  EditMeDto,
  EmailVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { UsersService } from '../users/users.service';
import { compare, hash } from '../../utils/bcrypt';
import { JwtService } from '../jwt/jwt.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Request, Response } from 'express';
import { getLocation } from '../../utils/location';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async main(request: Request, response: Response) {
    const ip =
      request.headers['x-real-ip'] ||
      request.headers['x-forwarded-for'] ||
      request.socket.remoteAddress ||
      '';

    const ipAddress = Array.isArray(ip) ? ip[0] : ip;
    const location = await getLocation(ipAddress);

    const requests = await this.prisma.requests.findFirst({
      where: {
        ip: ipAddress,
      },
    });

    const requestsCount = await this.prisma.requests.count({
      where: {
        ip: ipAddress,
      },
    });

    const data = {
      ip: ipAddress,
      location,
      lastVisit: new Date(),
      count: requestsCount + 1,
    };

    if (requests) {
      await this.prisma.requests.update({
        where: {
          id: requests.id,
        },
        data,
      });
    } else {
      await this.prisma.requests.create({
        data,
      });
    }

    try {
      return response.status(200).json({
        message: 'Success ✅',
      });
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser(dto);
    const token = await this.jwt.generateToken(user.id);

    await this.sendVerificationCode(user.id, user.email, user.firstName);

    try {
      return {
        message: `Successfully registered as ${user.firstName} ${user.lastName}`,
        token,
      };
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
      await this.sendVerificationCode(user.id, user.email, user.firstName);
    }

    const token = await this.jwt.generateToken(user.id);

    try {
      return {
        message: `Successfully logged in as ${user.firstName} ${user.lastName}`,
        token,
      };
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getMe(userId: number) {
    const user = await this.usersService.findById(userId);

    if (user.role === 'USER') {
      user.password = undefined;
    }

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async editMe(userId: number, { firstName, lastName, username }: EditMeDto) {
    const user = await this.usersService.findById(userId);

    if (username && username !== user.username) {
      const existUsername = await this.prisma.user.findUnique({
        where: {
          username: username.toLowerCase(),
        },
      });

      if (existUsername) {
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

  async emailVerification(userId: number, { code }: EmailVerificationDto) {
    const user = await this.usersService.findById(userId);

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

    const token = await this.jwt.generateResetPasswordSecret(user.id);
    const forgotLink = `${process.env.FRONTEND_BASE_URL}/password/reset/?token=${token}`;

    await Promise.all([
      this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          resetPasswordToken: token,
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
      return `Password reset link has been sent to ${user.email}`;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async resetPassword({ password, token }: ResetPasswordDto) {
    const compare = await this.jwt.compareResetPasswordSecret(token);
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
      return `Your password has been successfully updated`;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async generateVerificationCode(): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  async sendVerificationCode(
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
}
