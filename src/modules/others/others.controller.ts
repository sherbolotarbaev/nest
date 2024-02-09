import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { OthersService } from './others.service';
import { SendEmailOtpDto, CheckEmailOtpDto, CheckStatusDto } from './dto';
import { Public } from '@auth/common';

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
}
