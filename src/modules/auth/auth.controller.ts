import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, UserId } from './decorators';
import {
  LoginDto,
  RegisterDto,
  EditMeDto,
  EmailVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { Response } from 'express';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('cookie-test')
  @HttpCode(HttpStatus.OK)
  async cookieTest(@Res({ passthrough: true }) response: Response) {
    return response.cookie('test-cookie', 'test-cookie-value', {
      maxAge: 60 * 30 * 1000, // 30 minutes
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@UserId() userId: number) {
    return await this.authService.getMe(userId);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async editMe(@UserId() userId: number, @Body() dto: EditMeDto) {
    return await this.authService.editMe(userId, dto);
  }

  @Post('email-verification')
  @HttpCode(HttpStatus.OK)
  async emailVerification(
    @UserId() userId: number,
    @Body() dto: EmailVerificationDto,
  ) {
    return await this.authService.emailVerification(userId, dto);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
