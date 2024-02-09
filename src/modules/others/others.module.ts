import { Module } from '@nestjs/common';
import { OthersService } from './others.service';
import { OthersController } from './others.controller';

@Module({
  providers: [OthersService],
  controllers: [OthersController]
})
export class OthersModule {}
