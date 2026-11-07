import { PublicUser } from '@hiking/shared';
import { Injectable } from '@nestjs/common';

import { toPublicUser } from 'src/common/mappers';
import { AuthProvider, Prisma, User } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { SignupDto } from '../auth/dto/signup.dto';
import { AuthenticatedUser, GoogleUserPayload } from '../auth/interfaces';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getMe(user: AuthenticatedUser): PublicUser {
    return toPublicUser(user);
  }

  async updateMe(
    user: AuthenticatedUser,
    updateUserPayload: UpdateUserDto,
  ): Promise<PublicUser> {
    const { name } = updateUserPayload;

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { name },
    });

    return toPublicUser(updatedUser);
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

  async findOneWithSelect<S extends Prisma.UserSelect>(
    email: string,
    select: S,
  ): Promise<Prisma.UserGetPayload<{ select: S }> | null> {
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
