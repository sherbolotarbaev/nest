import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { ChatService } from './chat.service';

import { SessionAuthGuard, JWTAuthGuard, User } from '../auth/common';

import { CreateChatDto, CreateConversationDto } from './dto';

@Controller('chat')
@UseGuards(SessionAuthGuard, JWTAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createChat(@User() user: User, @Body() dto: CreateChatDto) {
    return await this.chatService.createChat(user, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getChats(@User() user: User) {
    return await this.chatService.getChats(user);
  }

  @Get(':chatId')
  @HttpCode(HttpStatus.OK)
  async getChat(
    @User() user: User,
    @Param('chatId', ParseIntPipe) chatId: number,
  ) {
    return await this.chatService.getChat(user, chatId);
  }

  @Post(':chatId/conversations')
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @User() user: User,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() dto: CreateConversationDto,
  ) {
    return await this.chatService.createConversation(user, chatId, dto);
  }

  @Get(':chatId/conversations')
  @HttpCode(HttpStatus.OK)
  async getConversations(
    @User() user: User,
    @Param('chatId', ParseIntPipe) chatId: number,
  ) {
    return await this.chatService.getConversations(user, chatId);
  }
}
