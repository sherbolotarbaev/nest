import { Public } from './modules/auth/common';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from './modules/prisma/prisma.service';
import axios from 'axios';
import { getLocation } from './utils/location';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

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

    this.fetchHealTchecks(ipAddress);

    const requests = await this.prisma.request.count();

    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'OK',
      views: requests > 0 ? requests + 1 : 0,
      sourceCode: 'https://github.com/sherbolotarbaev/nest',
    });
  }

  private async fetchHealTchecks(ip: string) {
    if (ip === '::1') return;

    const location = await getLocation(ip);

    await this.prisma.request.create({
      data: {
        ip,
        method: 'GET',
        status: 'SUCCESS',
        from: `${location.city}, ${location.country}`,
      },
    });

    try {
      await axios.get(
        'https://hc-ping.com/5782316a-b47f-44b9-8419-51da8d8dc126',
        {
          headers: {
            'x-forwarded-for': ip,
          },
        },
      );
    } catch (e: any) {
      console.error('SOMETHING WRONG WITH HEALTCHECKS.IO');
    }
  }
}
