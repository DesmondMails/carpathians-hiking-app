import { Injectable } from '@nestjs/common';
import { PublicUser } from '@hiking/shared';

import { Prisma, User } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { SignupDto } from '../auth/dto/signup.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
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
      },
    });

    return user;
  }
}
