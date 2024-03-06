import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { ChatGptService } from './chat-gpt.service';

import { Public } from '../auth/common';

import { StreamConversationDto } from './dto';

@Controller('chat-gpt')
export class ChatGptController {
  constructor(private readonly chatGptService: ChatGptService) {}

  @Public()
  @Post('transcribe')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('audio'))
  async transcribeAudio(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'audio/*',
          }),
        ],
      }),
    )
    audio: Express.Multer.File,
  ) {
    return await this.chatGptService.transcribeAudio(audio.buffer, 'en');
  }

  @Public()
  @Post('conversation/stream')
  @HttpCode(HttpStatus.OK)
  async streamConversation(
    @Res() response: Response,
    @Body() { text }: StreamConversationDto,
  ) {
    response.header({
      // 'Content-Type': 'text/event-stream',
      // 'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
      // Connection: 'keep-alive',
    });

    const stream = await this.chatGptService.chatGptStreamRequest(
      text,
      `Imagine you're an AI functioning as my personal Jarvis, your name is Jarvis, and you can call me Sher, assisting me in various tasks. Answer very shortly and clearly. Use Markdown since I'm using react-markdown for formatting. Additionally, you can use emojis.`,
    );

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? '';
      response.write(content);
    }

    response.end();
  }
}
