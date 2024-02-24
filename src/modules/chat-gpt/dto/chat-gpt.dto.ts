import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class StreamConversationDto {
  @IsNotEmpty({ message: 'Text cannot be empty' })
  @IsString({ message: 'Invalid text format' })
  @MinLength(1, { message: 'Text must be at least 1 characters long' })
  @MaxLength(8192, { message: 'Text cannot be longer than 8192 characters' })
  text: string;
}
