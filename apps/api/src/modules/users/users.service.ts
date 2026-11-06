import { PublicUser } from '@hiking/shared';
import { Injectable } from '@nestjs/common';

import { toPublicUser } from 'src/common/mappers';
import { AuthProvider, Prisma, User } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { SignupDto } from '../auth/dto/signup.dto';
import { GoogleUserPayload } from '../auth/interfaces';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getMe(user: User): PublicUser {
    return toPublicUser(user);
  }

  async updateMe(
    user: User,
    updateUserPayload: UpdateUserDto,
  ): Promise<User | null> {
    const { name } = updateUserPayload;

    return this.prisma.user.update({
      where: { id: user.id },
      data: { name },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  async attachGoogleId(userId: string, googleId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { googleId, authProvider: AuthProvider.GOOGLE },
    });
  }

  async createGoogleUser(googleUser: GoogleUserPayload): Promise<User> {
    return this.prisma.user.create({
      data: {
        authProvider: AuthProvider.GOOGLE,
        email: googleUser.email,
        googleId: googleUser.googleId,
        avatar: googleUser.avatar,
      },
    });
  }

  async findOneWithSelect(
    email: string,
    select: Prisma.UserSelect,
  ): Promise<Prisma.UserGetPayload<{ select: typeof select }> | null> {
    return this.prisma.user.findUnique({ where: { email }, select });
  }

  async create(signupDto: SignupDto): Promise<User> {
    const { email, password } = signupDto;

    const user = await this.prisma.user.create({
      data: {
        email,
        password,
        authProvider: AuthProvider.EMAIL,
      },
    });

    return user;
  }

  async updateHashedRefreshToken(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }
}
