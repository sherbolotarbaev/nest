import { BadRequestException, Injectable } from '@nestjs/common';
import { SendEmailOtpDto, CheckEmailOtpDto, CheckStatusDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import { MailerService } from '@nestjs-modules/mailer';
import { compare, hash } from '../../utils/bcrypt';
import moment from 'moment';

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
    const expirationTime = await this.generateExpirationTime();

    await Promise.all([
      this.prisma.emailOtp.upsert({
        where: { email: user.email },
        update: {
          otp: otpHash,
          expires: expirationTime,
          createdAt: new Date(),
        },
        create: { email: user.email, otp: otpHash, expires: expirationTime },
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
}
