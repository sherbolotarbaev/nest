import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SendEmailOtpDto {
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

export class CheckEmailOtpDto {
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsOptional()
  @IsNotEmpty({ message: 'OTP cannot be empty' })
  @IsString({ message: 'OTP must be a string' })
  @MinLength(6, { message: 'OTP must be exactly six digits' })
  @MaxLength(6, { message: 'OTP must be exactly six digits' })
  otp: string;
}

export class CheckStatusDto extends SendEmailOtpDto {}

export class SendMessageDto {
  @IsNotEmpty({ message: 'Full name cannot be empty' })
  @IsString({ message: 'Full name must be a string' })
  @MinLength(5, { message: 'Full name must be at least 5 characters long' })
  @MaxLength(128, { message: 'Full name cannot be longer than 128 characters' })
  fullName: string;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Message cannot be empty' })
  @IsString({ message: 'Message must be a string' })
  @MinLength(5, { message: 'Message must be at least 5 characters long' })
  @MaxLength(500, { message: 'Message cannot be longer than 500 characters' })
  message: string;
}

export class AddConnectionsDto {
  @IsNotEmpty({ message: 'Connection cannot be empty' })
  @IsString({ message: 'Connection must be a string' })
  connection: string;
}
