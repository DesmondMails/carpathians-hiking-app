import { PublicUser } from '@hiking/shared';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from 'src/prisma/generated/client';

import { UsersService } from './users.service';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Отримати інформацію про себе' })
  @ApiResponse({
    status: 200,
    description: 'Інформація про себе успішно отримана',
  })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @Get('me')
  async getMe(@CurrentUser() user: User): Promise<PublicUser> {
    return this.usersService.getMe(user);
  }
}
