import { Public } from '@auth/common';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { getLocation } from './utils/location';

@Controller()
export class AppController {
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async main(@Req() request: Request, @Res() response: Response) {
    const ip =
      request.headers['x-real-ip'] ||
      request.headers['x-forwarded-for'] ||
      request.socket.remoteAddress ||
      '';

    const ipAddress = Array.isArray(ip) ? ip[0] : ip;
    const location = await getLocation(ipAddress);

    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: `OK`,
      location: `${location.city}, ${location.country}`,
    });
  }
}
