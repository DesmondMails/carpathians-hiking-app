import type { PublicUser } from '@hiking/shared';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from 'src/prisma/generated/client';

import { PublicUserDto } from './dto/public-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
    type: PublicUserDto,
  })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @Get('me')
  getMe(@CurrentUser() user: User): PublicUser {
    return this.usersService.getMe(user);
  }

  @ApiOperation({ summary: 'Оновити інформацію про себе' })
  @ApiResponse({
    status: 200,
    description: 'Інформація про себе успішно оновлена',
  })
  @ApiResponse({ status: 400, description: 'Невалідні дані' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @Patch('me')
  updateMe(
    @CurrentUser() user: User,
    @Body() updateUserPayload: UpdateUserDto,
  ): Promise<User | null> {
    return this.usersService.updateMe(user, updateUserPayload);
  }
}
