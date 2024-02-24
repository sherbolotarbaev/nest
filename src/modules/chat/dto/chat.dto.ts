import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ConversationRole } from './chat.enum';

export class CreateChatDto {
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @IsString({ message: 'Invalid title format' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(25, { message: 'Title cannot be longer than 25 characters' })
  title: string;
}

export class CreateConversationDto {
  @IsNotEmpty({ message: 'Conversation role cannot be empty' })
  @IsEnum(ConversationRole, { message: 'Not a valid conversation role' })
  role: ConversationRole;

  @IsNotEmpty({ message: 'Content cannot be empty' })
  @IsString({ message: 'Invalid content format' })
  @MinLength(1, { message: 'Content must be at least 1 characters long' })
  @MaxLength(8192, { message: 'Content cannot be longer than 8192 characters' })
  content: string;
}
