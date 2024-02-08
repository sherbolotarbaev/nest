import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async uploadPhoto(userId: number, file: Express.Multer.File) {
    const user = await this.usersService.findById(userId);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const fileMimeTypes = [
      'image/jpg',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!fileMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    const filename = await this.supabaseService.uploadPhoto(user.id, file);
    const url = await this.supabaseService.getUrl('/photos', filename);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        photo: url,
      },
    });

    try {
      return updatedUser;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
