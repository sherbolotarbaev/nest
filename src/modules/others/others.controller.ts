import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { OthersService } from './others.service';

import {
  SendEmailOtpDto,
  CheckEmailOtpDto,
  CheckStatusDto,
  SendMessageDto,
} from './dto';

@Controller('others')
export class OthersController {
  constructor(private readonly othersService: OthersService) {}

  @Post('email-otp')
  @HttpCode(HttpStatus.OK)
  async sendEmailOtp(@Body() dto: SendEmailOtpDto) {
    return await this.othersService.sendEmailOtp(dto);
  }

  @Post('email-otp/check')
  @HttpCode(HttpStatus.OK)
  async checkEmailOtp(@Body() dto: CheckEmailOtpDto) {
    return await this.othersService.checkEmailOtp(dto);
  }

  @Post('email-otp/status')
  @HttpCode(HttpStatus.OK)
  async checkStatus(@Body() dto: CheckStatusDto) {
    return await this.othersService.checkStatus(dto);
  }

  @Post('message')
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Req() request: Request, @Body() dto: SendMessageDto) {
    return await this.othersService.sendMessage(request, dto);
  }

  @Post('views')
  @HttpCode(HttpStatus.OK)
  async addViews() {
    return await this.othersService.addViews();
  }
}
