import { RouteDetails } from '@hiking/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { Route, User } from 'src/prisma/generated/client';

import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RoutesService } from './routes.service';

@ApiBearerAuth()
@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Створити або фіналізувати маршрут' })
  @ApiResponse({ status: 201, description: 'Маршрут успішно створений' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  async createRoute(
    @CurrentUser() user: User,
    @Body() createRouteDto: CreateRouteDto,
  ): Promise<Route> {
    return this.routesService.createRoute(user.id, createRouteDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Оновити маршрут' })
  @ApiResponse({ status: 200, description: 'Маршрут успішно оновлений' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({
    status: 403,
    description: 'Користувач не має доступу до цього маршруту',
  })
  @ApiResponse({ status: 404, description: 'Маршрут не знайдено' })
  async updateRoute(
    @CurrentUser() user: User,
    @Param('id') routeId: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ): Promise<Route> {
    return this.routesService.updateRoute(routeId, user.id, updateRouteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати всі маршрути' })
  @ApiResponse({ status: 200, description: 'Всі маршрути успішно отримані' })
  async getAllRoutes(): Promise<Route[]> {
    return this.routesService.getAllRoutes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати маршрут по id' })
  @ApiResponse({ status: 200, description: 'Маршрут успішно отриманий' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({ status: 404, description: 'Маршрут не знайдено' })
  async getRouteById(@Param('id') routeId: string): Promise<RouteDetails> {
    return this.routesService.getRouteDetails(routeId);
  }

  @Get(':id/gpx-url')
  @ApiOperation({ summary: 'Отримати URL GPX-файлу' })
  @ApiResponse({ status: 200, description: 'URL GPX-файлу успішно отриманий' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({ status: 404, description: 'Draft не знайдено' })
  async getGpxUrl(
    @CurrentUser() user: User,
    @Param('id') routeId: string,
  ): Promise<string> {
    return this.routesService.getGpxUrl(routeId, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити маршрут' })
  @ApiResponse({ status: 204, description: 'Маршрут успішно видалений' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({
    status: 403,
    description: 'Користувач не має доступу до цього маршруту',
  })
  @ApiResponse({ status: 404, description: 'Маршрут не знайдено' })
  async deleteRoute(
    @Param('id') routeId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.routesService.deleteRoute(routeId, user.id);
  }
}
