import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { USER_ATTEMPTS } from './common';

import { CreateChatDto, CreateConversationDto } from './dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createChat(user: User, { title }: CreateChatDto) {
    const chat = await this.prisma.chat.create({
      data: {
        userId: user.id,
        title,
      },
    });

    try {
      return chat;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getChats(user: User) {
    const chats = await this.prisma.chat.findMany({
      where: {
        userId: user.id,
      },
    });

    try {
      return {
        count: chats.length,
        chats,
      };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getChat(user: User, chatId: number) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: user.id,
      },
      include: {
        conversations: true,
      },
    });

    if (!chat) {
      throw new BadRequestException("Chat doesn't exist");
    }

    if (!chat.isActive) {
      throw new ForbiddenException('Chat has been deactivated');
    }

    try {
      return chat;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async createConversation(
    user: User,
    chatId: number,
    { role, content }: CreateConversationDto,
  ) {
    const chat = await this.getChat(user, chatId);

    const attempts = USER_ATTEMPTS * 2;
    if (user.role === 'USER' && chat.conversations.length >= attempts) {
      throw new ForbiddenException('Insufficient number of attempts');
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        userId: user.id,
        chatId: chat.id,
        role,
        content,
      },
    });

    try {
      return conversation;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getConversations(user: User, chatId: number) {
    const chat = await this.getChat(user, chatId);

    const conversations = await this.prisma.conversation.findMany({
      where: {
        userId: user.id,
        chatId: chat.id,
      },
    });

    try {
      return conversations;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
