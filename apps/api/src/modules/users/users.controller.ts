import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PublicUser } from '@hiking/shared';
import type { User } from 'src/prisma/generated/client';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: User): Promise<PublicUser> {
    return this.usersService.getMe(user);
  }
}
