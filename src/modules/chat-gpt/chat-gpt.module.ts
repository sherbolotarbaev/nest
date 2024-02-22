import { Global, Module } from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';
import { ChatGptController } from './chat-gpt.controller';

@Global()
@Module({
  providers: [ChatGptService],
  exports: [ChatGptService],
  controllers: [ChatGptController],
})
export class ChatGptModule {}
