import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { UserId } from '../auth/common';
import { CreateChatDto, CreateConversationDto } from './dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createChat(@UserId() userId: number, @Body() dto: CreateChatDto) {
    return await this.chatService.createChat(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getChats(@UserId() userId: number) {
    return await this.chatService.getChats(userId);
  }

  @Get(':chatId')
  @HttpCode(HttpStatus.OK)
  async getChat(
    @UserId() userId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
  ) {
    return await this.chatService.getChat(userId, chatId);
  }

  @Post(':chatId/conversations')
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @UserId() userId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() dto: CreateConversationDto,
  ) {
    return await this.chatService.createConversation(userId, chatId, dto);
  }

  @Get(':chatId/conversations')
  @HttpCode(HttpStatus.OK)
  async getConversations(
    @UserId() userId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
  ) {
    return await this.chatService.getConversations(userId, chatId);
  }
}
