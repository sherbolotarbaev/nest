import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { OthersService } from './others.service';
import {
  SendEmailOtpDto,
  CheckEmailOtpDto,
  CheckStatusDto,
  SendMessageDto,
} from './dto';
import { Public } from '../auth/common';
import { Request } from 'express';

@Controller('others')
export class OthersController {
  constructor(private readonly othersService: OthersService) {}

  @Public()
  @Post('/email-otp')
  @HttpCode(HttpStatus.OK)
  async sendEmailOtp(@Body() dto: SendEmailOtpDto) {
    return await this.othersService.sendEmailOtp(dto);
  }

  @Public()
  @Post('/email-otp/check')
  @HttpCode(HttpStatus.OK)
  async checkEmailOtp(@Body() dto: CheckEmailOtpDto) {
    return await this.othersService.checkEmailOtp(dto);
  }

  @Public()
  @Post('/email-otp/status')
  @HttpCode(HttpStatus.OK)
  async checkStatus(@Body() dto: CheckStatusDto) {
    return await this.othersService.checkStatus(dto);
  }

  @Public()
  @Post('/message')
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Req() request: Request, @Body() dto: SendMessageDto) {
    return await this.othersService.sendMessage(request, dto);
  }

  @Public()
  @Post('/requests')
  @HttpCode(HttpStatus.OK)
  async newRequest(@Req() request: Request) {
    return await this.othersService.newRequest(request);
  }

  @Public()
  @Get('/requests')
  @HttpCode(HttpStatus.OK)
  async getRequests() {
    return await this.othersService.getRequests();
  }
}
