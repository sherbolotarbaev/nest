import {
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserId } from '../auth/decorators';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Put('photo')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @UserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.uploadService.uploadPhoto(userId, file);
  }
}
