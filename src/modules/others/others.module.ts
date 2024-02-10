import { Module } from '@nestjs/common';
import { OthersService } from './others.service';
import { OthersController } from './others.controller';
import { UsersService } from '@users/users.service';

@Module({
  providers: [OthersService, UsersService],
  controllers: [OthersController],
})
export class OthersModule {}
