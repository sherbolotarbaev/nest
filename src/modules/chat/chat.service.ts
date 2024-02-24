import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateChatDto, CreateConversationDto } from './dto';
import { USER_ATTEMPTS } from './common';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createChat(userId: number, { title }: CreateChatDto) {
    const user = await this.usersService.findById(userId);

    const existingChat = await this.prisma.chat.findFirst({
      where: {
        userId: user.id,
        title: title,
      },
    });

    if (existingChat) {
      throw new ConflictException('Chat already exists');
    }

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

  async getChats(userId: number) {
    const user = await this.usersService.findById(userId);

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

  async getChat(chatId: number, userId: number) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: userId,
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
    userId: number,
    chatId: number,
    { role, content }: CreateConversationDto,
  ) {
    const user = await this.usersService.findById(userId);
    const chat = await this.getChat(chatId, user.id);

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

  async getConversations(userId: number, chatId: number) {
    const user = await this.usersService.findById(userId);
    const chat = await this.getChat(chatId, user.id);

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
