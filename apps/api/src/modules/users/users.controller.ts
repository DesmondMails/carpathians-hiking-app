import type { PublicUser } from '@hiking/shared';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces';

import { PublicUserDto } from './dto/public-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Отримати інформацію про себе' })
  @ApiResponse({
    status: 200,
    description: 'Інформація про себе успішно отримана',
    type: PublicUserDto,
  })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser): PublicUser {
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
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateUserPayload: UpdateUserDto,
  ): Promise<PublicUser> {
    return this.usersService.updateMe(user, updateUserPayload);
  }

  @ApiOperation({ summary: 'Завершити онбординг' })
  @ApiResponse({
    status: 200,
    description: 'Онбординг завершено (повторний виклик нічого не змінює)',
    type: PublicUserDto,
  })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @Post('me/onboarding/complete')
  @HttpCode(HttpStatus.OK)
  completeOnboarding(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PublicUser> {
    return this.usersService.completeOnboarding(user);
  }
}
