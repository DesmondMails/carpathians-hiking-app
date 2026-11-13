import {
  EditableRoute,
  PresignedUrlResponse,
  RouteDetails,
  RouteListItem,
  RoutePoisResponse,
} from '@hiking/shared';
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
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces';
import type { Route, SavedRoute } from 'src/prisma/generated/client';

import { CompleteRouteImageUploadDto } from './dto/complete-route-image-upload.dto';
import { CreateRouteImagePresignedDto } from './dto/create-route-image-presigned.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { SavedRouteQueryDto } from './dto/saved-route-query.dto';
import { SearchRouteQueryDto } from './dto/search-route-query.dto';
import { SetRouteCoverDto } from './dto/set-route-cover.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RoutesService } from './routes.service';
import { SavedRoutesService } from './saved-routes.service';

@ApiBearerAuth()
@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(
    private routesService: RoutesService,
    private savedRoutesService: SavedRoutesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Створити або фіналізувати маршрут' })
  @ApiResponse({ status: 201, description: 'Маршрут успішно створений' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  async createRoute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createRouteDto: CreateRouteDto,
  ): Promise<Route> {
    return this.routesService.createRoute(user.id, createRouteDto);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Отримати збережені маршрути користувача' })
  @ApiResponse({
    status: 200,
    description: 'Збережені маршрути успішно отримані',
  })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  async getSavedRoutes(
    @Query() savedRoutesQuery: SavedRouteQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RouteListItem[]> {
    return this.savedRoutesService.getSavedRoutes(user.id, savedRoutesQuery);
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
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') routeId: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ): Promise<Route> {
    return this.routesService.updateRoute(routeId, user.id, updateRouteDto);
  }

  @Get(':id/edit')
  @ApiOperation({ summary: 'Отримати маршрут для редагування' })
  @ApiResponse({
    status: 200,
    description: 'Маршрут для редагування успішно отриманий',
  })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({
    status: 403,
    description: 'Користувач не має доступу до цього маршруту',
  })
  @ApiResponse({ status: 404, description: 'Маршрут не знайдено' })
  async getEditableRoute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') routeId: string,
  ): Promise<EditableRoute> {
    return this.routesService.getEditableRoute(routeId, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати всі маршрути' })
  @ApiResponse({ status: 200, description: 'Всі маршрути успішно отримані' })
  @ApiResponse({
    status: 400,
    description: 'Некоректні параметри пошуку або пагінації',
  })
  async getAllRoutes(
    @CurrentUser() user: AuthenticatedUser,
    @Query()
    searchQuery?: SearchRouteQueryDto,
  ): Promise<RouteListItem[]> {
    return this.routesService.getAllRoutes(user.id, searchQuery);
  }

  @Get(':id/pois')
  @ApiOperation({ summary: 'Отримати POI маршруту по id' })
  @ApiResponse({ status: 200, description: 'POI маршруту успішно отримані' })
  @ApiResponse({ status: 404, description: 'Маршрут не знайдено' })
  async getRoutePois(@Param('id') routeId: string): Promise<RoutePoisResponse> {
    return this.routesService.getRoutePois(routeId);
  }

  @Get(':id/pois/featured')
  @ApiOperation({ summary: 'Отримати Featured POI маршруту по id' })
  @ApiResponse({
    status: 200,
    description: 'Featured POI маршруту успішно отримані',
  })
  @ApiResponse({ status: 404, description: 'Маршрут не знайдено' })
  async getFeaturedRoutePois(
    @Param('id') routeId: string,
  ): Promise<RoutePoisResponse> {
    return this.routesService.getFeaturedRoutePois(routeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати маршрут по id' })
  @ApiResponse({ status: 200, description: 'Маршрут успішно отриманий' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({ status: 404, description: 'Маршрут не знайдено' })
  async getRouteById(
    @Param('id') routeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RouteDetails> {
    return this.routesService.getRouteDetails(routeId, user.id);
  }

  @Get(':id/gpx-url')
  @ApiOperation({ summary: 'Отримати URL GPX-файлу' })
  @ApiResponse({ status: 200, description: 'URL GPX-файлу успішно отриманий' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({ status: 404, description: 'Маршрут або GPX-файл не знайдено' })
  async getGpxUrl(@Param('id') routeId: string): Promise<string> {
    return this.routesService.getGpxUrl(routeId);
  }

  @Post(':id/images/presigned')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Створити посилання для завантаження зображення маршруту',
  })
  @ApiResponse({
    status: 200,
    description: 'Посилання для завантаження зображення успішно створено',
  })
  async createRouteImageUploadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') routeId: string,
    @Body() createRouteImagePresignedDto: CreateRouteImagePresignedDto,
  ): Promise<PresignedUrlResponse> {
    return this.routesService.createRouteImagePresignedUrl(
      routeId,
      user.id,
      createRouteImagePresignedDto,
    );
  }

  @Post(':id/images/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Завершити завантаження зображення маршруту' })
  @ApiResponse({ status: 200, description: 'Зображення успішно завантажено' })
  async completeRouteImageUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') routeId: string,
    @Body() completeRouteImageUploadDto: CompleteRouteImageUploadDto,
  ): Promise<void> {
    return this.routesService.completeRouteImageUpload(
      routeId,
      user.id,
      completeRouteImageUploadDto,
    );
  }

  @Patch(':id/cover')
  @ApiOperation({ summary: 'Оновити обкладинку маршруту' })
  @ApiResponse({ status: 200, description: 'Обкладинку успішно оновлено' })
  async setRouteCover(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') routeId: string,
    @Body() setRouteCoverDto: SetRouteCoverDto,
  ): Promise<void> {
    return this.routesService.setRouteCover(
      routeId,
      setRouteCoverDto.imageId,
      user.id,
    );
  }

  @Post(':id/poi-enrichment')
  @ApiOperation({ summary: 'Запланувати enrichment POI маршруту' })
  @ApiResponse({ status: 200, description: 'Enrichment POI заплановано' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({ status: 404, description: 'Маршрут не знайдено' })
  async reEnrichRoutePois(
    @Param('id') routeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.routesService.reEnrichRoutePois(routeId, user.id);
  }

  @Put(':id/saved')
  @ApiOperation({ summary: 'Зберегти маршрут' })
  @ApiResponse({ status: 200, description: 'Маршрут успішно збережено' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({
    status: 404,
    description: 'Маршрут не знайдено або недоступний',
  })
  async saveRoute(
    @Param('id') routeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SavedRoute> {
    return this.savedRoutesService.saveRoute(routeId, user.id);
  }

  @Delete(':id/saved')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити збереження' })
  @ApiResponse({ status: 204, description: 'Збереження успішно видалене' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  async deleteSavedRoute(
    @Param('id') routeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.savedRoutesService.deleteSaving(routeId, user.id);
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
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.routesService.deleteRoute(routeId, user.id);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити зображення маршруту' })
  @ApiResponse({ status: 204, description: 'Зображення успішно видалено' })
  async deleteRouteImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') routeId: string,
    @Param('imageId') imageId: string,
  ): Promise<void> {
    return this.routesService.deleteRouteImage(routeId, imageId, user.id);
  }
}
