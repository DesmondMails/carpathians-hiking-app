import { HomeResponse } from '@hiking/shared';
import { Controller, Get, Query } from '@nestjs/common';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { HomeService } from './home.service';
import type { AuthenticatedUser } from '../auth/interfaces';
import { GetHomeResponseDto } from './dto/get-home-response.dto';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHomeLists(
    @CurrentUser() user: AuthenticatedUser,
    @Query() params: GetHomeResponseDto,
  ): Promise<HomeResponse> {
    return this.homeService.getHomeLists(user, params);
  }
}
