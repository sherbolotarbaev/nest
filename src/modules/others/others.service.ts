import { BadRequestException, Injectable } from '@nestjs/common';
import { SendEmailOtpDto, CheckStatusDto, CheckEmailOtpDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { compare, hash } from '../../utils/bcrypt';
import moment from 'moment';

@Injectable()
export class OthersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async sendEmailOtp({ email }: SendEmailOtpDto) {
    const user = await this.prisma.emailOtp.findUnique({
      where: {
        email,
      },
    });

    if (user && user.isVerified) {
      return {
        verified: true,
        message: 'User already verified!',
      };
    }

    const newOtp = await this.generateOtp();
    const otpHash = await hash(newOtp);
    const expirationTime = await this.generateExpirationTime();

    await Promise.all([
      this.prisma.emailOtp.upsert({
        where: { email },
        update: { otp: otpHash, expires: expirationTime },
        create: { email, otp: otpHash, expires: expirationTime },
      }),
      this.mailerService.sendMail({
        to: email,
        from: process.env.MAILER_USER,
        subject: 'Email Verification OTP',
        html: `
            <h2>Hey!</h2>
            <p>Your email verification OTP is <strong style="color:blue">${newOtp}</strong>.</p>
        `,
      }),
    ]);

    try {
      return {
        verified: false,
        message: 'Email verification OTP successfully sent!',
      };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async checkEmailOtp({ email, otp }: CheckEmailOtpDto) {
    const user = await this.getExistingUser(email);

    if (user.isVerified) {
      return {
        verified: true,
        message: 'User already verified!',
      };
    }

    const comparedOtp = await compare(otp, user.otp);
    if (!comparedOtp) {
      throw new BadRequestException('Invalid verification OTP');
    }

    if (user.expires < moment().unix()) {
      throw new BadRequestException('Verification OTP has expired');
    }

    await this.prisma.emailOtp.update({
      where: { email: user.email },
      data: { isVerified: true },
    });

    return {
      verified: true,
      email: user.email,
      message: 'User successfully verified!',
    };
  }

  async checkStatus({ email }: CheckStatusDto) {
    const user = await this.getExistingUser(email);

    if (user && user.isVerified) {
      return { verified: true };
    }

    return { verified: false };
  }

  private async generateOtp() {
    const otp = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');

    return otp;
  }

  private async generateExpirationTime() {
    const expirationTime = moment().add(5, 'minutes').unix();

    return expirationTime;
  }

  private async getExistingUser(email: string) {
    const user = await this.prisma.emailOtp.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
}
