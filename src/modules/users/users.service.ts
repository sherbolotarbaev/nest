import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto';
import { hash } from '../../utils/bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(
    userId: number,
    query: string,
  ): Promise<{ count: number; users: User[] }> {
    const user = await this.findById(userId);

    if (user.role === 'USER') {
      throw new ForbiddenException(
        'You do not have the necessary permission to access users information',
      );
    }

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            role: 'USER',
            AND: query
              ? [
                  {
                    OR: [
                      { firstName: { contains: query, mode: 'insensitive' } },
                      { lastName: { contains: query, mode: 'insensitive' } },
                      { email: { contains: query, mode: 'insensitive' } },
                    ],
                  },
                ]
              : [],
          },
          {
            role: 'ADMIN',
            AND: query
              ? [
                  {
                    OR: [
                      { firstName: { contains: query, mode: 'insensitive' } },
                      { lastName: { contains: query, mode: 'insensitive' } },
                      { email: { contains: query, mode: 'insensitive' } },
                    ],
                  },
                ]
              : [],
          },
        ],
      },
    });

    try {
      return {
        count: users.length,
        users,
      };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getUser(userId: number, username: string): Promise<User> {
    const user = await this.findById(userId);

    if (user.role === 'USER') {
      throw new ForbiddenException(
        'You do not have the necessary permission to access user information',
      );
    }

    // Ensure that username is a string
    if (!isNaN(parseInt(username))) {
      throw new ConflictException('Parameter username must be a string');
    }

    try {
      return this.findByUsername(username);
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async deleteUser(
    userId: number,
    username: string,
  ): Promise<{ success: boolean }> {
    const user = await this.findById(userId);

    if (user.role === 'USER') {
      throw new ForbiddenException(
        'You do not have the necessary permission to delete a user',
      );
    }

    // Ensure that username is a string
    if (!isNaN(parseInt(username))) {
      throw new ConflictException('Parameter username must be a string');
    }

    const dbUser = await this.findByUsername(username);

    if (dbUser.id === user.id) {
      throw new ForbiddenException(
        `You can't delete yourself, please inform someone with a Admin role`,
      );
    }

    try {
      await this.prisma.user.delete({
        where: {
          id: dbUser.id,
        },
      });

      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async createUser({
    firstName,
    lastName,
    email,
    password,
  }: CreateUserDto): Promise<User> {
    const existUser = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existUser) {
      throw new ConflictException('User already exists');
    }

    try {
      const hashedPassword = await hash(password);
      const username = await this.generateUniqueUsername(email);

      const user = await this.prisma.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          username,
          password: hashedPassword,
        },
      });

      user.password = undefined;

      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async findById(id: number): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username.toLowerCase(),
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    let username = email.toLowerCase().split('@')[0].trim();

    const existUsername = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existUsername) {
      username = `${username}-${Date.now()}`;
    }

    return username;
  }
}
