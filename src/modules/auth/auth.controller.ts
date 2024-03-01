import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import {
  TokenInterceptor,
  User,
  SessionAuthGuard,
  JWTAuthGuard,
  LocalAuthGuard,
  Public,
} from './common';

import {
  RegisterDto,
  EditMeDto,
  EmailVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';

@Controller()
@UseGuards(SessionAuthGuard, JWTAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(TokenInterceptor)
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async login(@User() user: User) {
    return user;
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@User() user: User) {
    return await this.authService.getMe(user);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async editMe(@User() user: User, @Body() dto: EditMeDto) {
    return await this.authService.editMe(user, dto);
  }

  @Post('email-verification')
  @HttpCode(HttpStatus.OK)
  async emailVerification(
    @User() user: User,
    @Body() dto: EmailVerificationDto,
  ) {
    return await this.authService.emailVerification(user, dto);
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
    return await this.authService.resetPassword(dto);
  }
}
