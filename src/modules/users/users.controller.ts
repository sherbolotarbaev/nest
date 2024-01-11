import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserId } from '../auth/decorators';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(@UserId() userId: number, @Query('q') query: string) {
    return await this.usersService.getUsers(userId, query);
  }

  @Get(':username')
  @HttpCode(HttpStatus.OK)
  async getUser(@UserId() userId: number, @Param('username') username: string) {
    return await this.usersService.getUser(userId, username);
  }

  @Delete(':username')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @UserId() userId: number,
    @Param('username') username: string,
  ) {
    return await this.usersService.deleteUser(userId, username);
  }
}
