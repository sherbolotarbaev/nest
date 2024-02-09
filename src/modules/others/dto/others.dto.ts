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
