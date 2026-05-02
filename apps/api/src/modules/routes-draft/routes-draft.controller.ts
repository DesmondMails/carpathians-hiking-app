import { PresignedUrlResponse } from '@hiking/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FileExtensionValidator } from 'src/common/validators/file-extension.validator';
import type { User, RouteDraft, Route } from 'src/prisma/generated/client';

import { CompleteDraftImageUploadDto } from './dto/complete-image-upload.dto';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';
import { CreateRouteDraftDto } from './dto/create-route-draft.dto';
import { FinalizeRouteDraftDto } from './dto/finalize-route-draft.dto';
import { UpdateRouteDraftDto } from './dto/update-route-draft.dto';
import { RoutesDraftService } from './routes-draft.service';

@ApiBearerAuth()
@ApiTags('routes-draft')
@Controller('routes-draft')
export class RoutesDraftController {
  constructor(private routesDraftService: RoutesDraftService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Створити draft маршруту' })
  @ApiResponse({ status: 201, description: 'Draft маршрут успішно створений' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  async createRouteDraft(
    @CurrentUser() user: User,
    @Body() createRouteDraftDto: CreateRouteDraftDto,
  ): Promise<RouteDraft> {
    return this.routesDraftService.createRouteDraft(
      user.id,
      createRouteDraftDto,
    );
  }

  @Post('/import-gpx')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Імпортувати GPX-файл' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'GPX-файл (application/gpx+xml)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'GPX-файл успішно імпортований' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({ status: 400, description: 'Неправильний формат файлу' })
  async importGpx(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileExtensionValidator({ extensions: ['.gpx'] })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<RouteDraft> {
    return this.routesDraftService.createRouteDraftFromGpx(user.id, file);
  }

  @Post(':id/finalize')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Фіналізувати draft маршруту' })
  @ApiResponse({
    status: 201,
    description: 'Draft маршрут успішно фіналізований',
  })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({
    status: 403,
    description: 'Користувач не має доступу до цього draft',
  })
  @ApiResponse({ status: 404, description: 'Draft не знайдено' })
  async finalizeRouteDraft(
    @CurrentUser() user: User,
    @Param('id') routeDraftId: string,
    @Body() finalizeRouteDraftDto: FinalizeRouteDraftDto,
  ): Promise<Route> {
    return this.routesDraftService.finalizeRouteDraft(
      routeDraftId,
      user.id,
      finalizeRouteDraftDto,
    );
  }

  @Post(':id/images/presigned')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Створити посилання для завантаження зображень' })
  @ApiResponse({
    status: 200,
    description: 'Посилання для завантаження зображень успішно створено',
  })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({
    status: 403,
    description: 'Користувач не має доступу до цього draft',
  })
  @ApiResponse({ status: 404, description: 'Draft не знайдено' })
  async createPresignedImageUploadUrl(
    @CurrentUser() user: User,
    @Param('id') routeDraftId: string,
    @Body() createPresignedUrlDto: CreatePresignedUrlDto,
  ): Promise<PresignedUrlResponse> {
    return this.routesDraftService.createPresignedUrl(
      routeDraftId,
      user.id,
      createPresignedUrlDto,
    );
  }

  @Post(':id/images/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Завершити завантаження зображення' })
  @ApiResponse({ status: 200, description: 'Зображення успішно завантажено' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({
    status: 403,
    description: 'Користувач не має доступу до цього draft',
  })
  @ApiResponse({ status: 404, description: 'Draft не знайдено' })
  async completeDraftImageUpload(
    @CurrentUser() user: User,
    @Param('id') routeDraftId: string,
    @Body() completeDraftImageUploadDto: CompleteDraftImageUploadDto,
  ): Promise<void> {
    return this.routesDraftService.completeDraftImageUpload(
      routeDraftId,
      user.id,
      completeDraftImageUploadDto,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Оновити draft маршруту' })
  @ApiResponse({ status: 200, description: 'Draft маршрут успішно оновлений' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({
    status: 403,
    description: 'Користувач не має доступу до цього draft',
  })
  @ApiResponse({ status: 404, description: 'Draft не знайдено' })
  async updateRouteDraft(
    @CurrentUser() user: User,
    @Param('id') routeDraftId: string,
    @Body() updateRouteDraftDto: UpdateRouteDraftDto,
  ): Promise<RouteDraft> {
    return this.routesDraftService.updateRouteDraft(
      user.id,
      routeDraftId,
      updateRouteDraftDto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати draft маршруту по id' })
  @ApiResponse({ status: 200, description: 'Draft маршрут успішно отриманий' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({
    status: 403,
    description: 'Користувач не має доступу до цього draft',
  })
  @ApiResponse({ status: 404, description: 'Draft не знайдено' })
  async getRouteDraftById(
    @CurrentUser() user: User,
    @Param('id') routeDraftId: string,
  ): Promise<RouteDraft> {
    return this.routesDraftService.findOwnedRouteDraftById(
      routeDraftId,
      user.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити draft маршруту' })
  @ApiResponse({ status: 204, description: 'Draft маршрут успішно видалений' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({
    status: 403,
    description: 'Користувач не має доступу до цього draft',
  })
  @ApiResponse({ status: 404, description: 'Draft не знайдено' })
  async deleteRouteDraft(
    @CurrentUser() user: User,
    @Param('id') routeDraftId: string,
  ): Promise<void> {
    return this.routesDraftService.deleteRouteDraft(routeDraftId, user.id);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити зображення draft маршруту' })
  @ApiResponse({ status: 204, description: 'Зображення успішно видалено' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({
    status: 403,
    description: 'Користувач не має доступу до цього draft',
  })
  @ApiResponse({ status: 404, description: 'Зображення не знайдено' })
  async deleteRouteDraftImage(
    @CurrentUser() user: User,
    @Param('id') routeDraftId: string,
    @Param('imageId') imageId: string,
  ): Promise<void> {
    return this.routesDraftService.deleteRouteDraftImage(
      routeDraftId,
      imageId,
      user.id,
    );
  }
}
