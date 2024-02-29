import { BadRequestException, Injectable } from '@nestjs/common';
import {
  SendEmailOtpDto,
  CheckEmailOtpDto,
  CheckStatusDto,
  SendMessageDto,
} from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import { MailerService } from '@nestjs-modules/mailer';
import { compare, hash } from '../../utils/bcrypt';
import { verifyEmail } from '../../utils/email';
import { getLocation } from '../../utils/location';
import { Request } from 'express';
import moment from 'moment';
import 'moment-timezone';
import axios from 'axios';

@Injectable()
export class OthersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async sendEmailOtp({ email }: SendEmailOtpDto) {
    const user = await this.usersService.findByEmail(email);

    const newOtp = await this.generateOtp();
    const otpHash = await hash(newOtp);

    await Promise.all([
      this.prisma.emailOtp.upsert({
        where: { email: user.email },
        update: {
          otp: otpHash,
          expires: moment().add(5, 'minutes').unix(),
          createdAt: new Date(),
        },
        create: {
          email: user.email,
          otp: otpHash,
          expires: moment().add(5, 'minutes').unix(),
        },
      }),
      this.mailerService.sendMail({
        to: user.email,
        from: process.env.MAILER_USER,
        subject: 'Email Verification OTP',
        html: `
            <h2>Hey!</h2>
            <p>Your email verification OTP is <strong style="color:blue">${newOtp}</strong>.</p>
        `,
      }),
    ]);

    try {
      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async checkEmailOtp({ email, otp }: CheckEmailOtpDto) {
    const user = await this.usersService.findByEmail(email);

    const emailOtp = await this.prisma.emailOtp.findUnique({
      where: {
        email: user.email,
      },
    });

    const comparedOtp = await compare(otp, emailOtp.otp);
    if (!comparedOtp) {
      throw new BadRequestException('Invalid verification OTP');
    }

    if (emailOtp.expires < moment().unix()) {
      throw new BadRequestException('Verification OTP has expired');
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
      return this.jwt.generateToken(user.id);
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async checkStatus({ email }: CheckStatusDto) {
    const user = await this.usersService.findByEmail(email);

    const emailOtp = await this.prisma.emailOtp.findUnique({
      where: {
        email: user.email,
      },
    });

    if (emailOtp.expires < moment().unix()) {
      throw new BadRequestException('Verification OTP has expired');
    }

    try {
      return {
        verified: emailOtp.isVerified,
      };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async sendMessage(
    request: Request,
    { fullName, email, message }: SendMessageDto,
  ) {
    const isEmailValid = await verifyEmail(email.toLowerCase());

    if (!isEmailValid) {
      throw new BadRequestException('Your email is not valid');
    }

    const ip =
      request.headers['x-real-ip'] ||
      request.headers['x-forwarded-for'] ||
      request.socket.remoteAddress ||
      '';

    const ipAddress = Array.isArray(ip) ? ip[0] : ip;
    const location = await getLocation(ipAddress);

    const device = request.headers['user-agent'];

    const template = () => {
      let msg = `🌐  IP: <b>${ipAddress}</b>\n`;
      msg += `👤  full name: <b>${fullName}</b>\n`;
      msg += `📪  email: <b>${email}</b>\n`;
      msg += `✉️  message: <b>${message}</b>\n`;
      msg += `📍  location: <b>${location.city}, ${location.country}</b>\n`;
      msg += `⏱️  timezone: <b>${location.timezone}</b>\n`;
      msg += `💻  device: <b>${this.getDeviceInfo(device)}</b>`;

      return msg;
    };

    const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
    const URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    try {
      await axios.post(URL, {
        chat_id: CHAT_ID,
        parse_mode: 'html',
        text: template(),
      });

      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async addViews() {
    try {
      await this.prisma.views.upsert({
        where: {
          id: 1,
        },
        update: {
          count: {
            increment: 1,
          },
          lastViewAt: moment()
            .tz('Asia/Bishkek')
            .format('DD.MM.YYYY hh:mm:ss A'),
        },
        create: {
          count: 1,
          lastViewAt: moment()
            .tz('Asia/Bishkek')
            .format('DD.MM.YYYY hh:mm:ss A'),
        },
      });

      const { count } = await this.prisma.views.findFirst({ where: { id: 1 } });

      return count;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  private async generateOtp() {
    const otp = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');

    return otp;
  }

  private getDeviceInfo(userAgent: string) {
    let deviceInfo = 'Unknown';
    const userAgentLowerCase = userAgent.toLowerCase();

    switch (true) {
      case userAgentLowerCase.includes('iphone'):
        const matchIphone = userAgent.match(/iPhone\s(?:OS\s)?([\d_]+)/);
        if (matchIphone) {
          deviceInfo = `iPhone ${this.getIOSVersion(matchIphone[1])}`;
        } else {
          deviceInfo = 'iPhone';
        }
        break;
      case userAgentLowerCase.includes('android'):
        const matchAndroid = userAgent.match(/Android\s([\d.]+)/);
        if (matchAndroid) {
          deviceInfo = `Android ${matchAndroid[1]}`;
        } else {
          deviceInfo = 'Android';
        }
        break;
      case userAgentLowerCase.includes('macintosh'):
        deviceInfo = 'MacOS';
        break;
      case userAgentLowerCase.includes('windows'):
        deviceInfo = 'Windows';
        break;
      case userAgentLowerCase.includes('linux'):
        deviceInfo = 'Linux';
        break;
      default:
        break;
    }

    return deviceInfo;
  }

  private getIOSVersion(versionString: string) {
    return versionString.replace(/_/g, '.');
  }
}
