import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';

import { OthersService } from './others.service';

import { Public, TokenInterceptor } from '../auth/common';

import {
  SendEmailOtpDto,
  CheckEmailOtpDto,
  CheckStatusDto,
  SendMessageDto,
} from './dto';

@Controller('others')
@UseInterceptors(ClassSerializerInterceptor)
export class OthersController {
  constructor(private readonly othersService: OthersService) {}

  @Public()
  @Post('email-otp')
  @HttpCode(HttpStatus.OK)
  async sendEmailOtp(@Body() dto: SendEmailOtpDto) {
    return await this.othersService.sendEmailOtp(dto);
  }

  @Public()
  @Post('email-otp/check')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(TokenInterceptor)
  async checkEmailOtp(@Body() dto: CheckEmailOtpDto) {
    return await this.othersService.checkEmailOtp(dto);
  }

  @Public()
  @Post('email-otp/status')
  @HttpCode(HttpStatus.OK)
  async checkStatus(@Body() dto: CheckStatusDto) {
    return await this.othersService.checkStatus(dto);
  }

  @Public()
  @Post('message')
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Req() request: Request, @Body() dto: SendMessageDto) {
    return await this.othersService.sendMessage(request, dto);
  }

  @Public()
  @Post('views')
  @HttpCode(HttpStatus.OK)
  async addViews() {
    return await this.othersService.addViews();
  }
}
