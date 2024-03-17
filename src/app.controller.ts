import { Ip, Public } from './modules/auth/common';
import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';

import axios from 'axios';

@Controller()
export class AppController {
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async main(@Ip() ip: string, @Res() response: Response) {
    this.fetchHealTchecks(ip);

    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'OK ✅',
      sourceCode: 'https://github.com/sherbolotarbaev/nest',
    });
  }

  private async fetchHealTchecks(ip: string) {
    if (ip === '::1') return;

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
