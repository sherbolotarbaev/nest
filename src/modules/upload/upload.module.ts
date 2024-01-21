import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UsersService } from '../users/users.service';

@Module({
  providers: [UploadService, UsersService],
  controllers: [UploadController],
})
export class UploadModule {}
