import { randomUUID } from 'node:crypto';

import {
  EditableRoute,
  PresignedUrlResponse,
  RouteDetails,
  RouteDraftPreview,
} from '@hiking/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  toEditableRoute,
  toRouteCreateInput,
  toRouteView,
} from 'src/modules/routes/mappers';
import {
  Prisma,
  Route,
  RouteImageStatus,
  RouteDraft,
  RouteImage,
  User,
} from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { CompleteRouteImageUploadDto } from './dto/complete-route-image-upload.dto';
import { CreateRouteImagePresignedDto } from './dto/create-route-image-presigned.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { calculateDerivedRouteValues } from './utils/calculate-derived-route-values';
import { FinalizeRouteDraftDto } from '../routes-draft/dto/finalize-route-draft.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async createRoute(
    userId: string,
    createRouteDto: CreateRouteDto,
  ): Promise<Route> {
    return this.prisma.route.create({
      data: {
        ...createRouteDto,
        createdByUserId: userId,
      },
    });
  }

  async updateRoute(
    routeId: string,
    userId: string,
    updateRouteDto: UpdateRouteDto,
  ): Promise<Route> {
    await this.findOwnedRouteById(routeId, userId);

    return this.prisma.route.update({
      where: { id: routeId },
      data: updateRouteDto,
    });
  }

  async getEditableRoute(
    routeId: string,
    userId: string,
  ): Promise<EditableRoute> {
    const route = await this.findOwnedRouteWithImagesById(routeId, userId);
    const imageUrls = await Promise.all(
      route.images.map((image) => this.resolveImageUrl(image.storageKey)),
    );

    return toEditableRoute(route, imageUrls);
  }

  async findOwnedRouteById(routeId: string, userId: string): Promise<Route> {
    const route = await this.findRouteById(routeId);

    this.checkRouteOwnership(route, userId);

    return route;
  }

  async getRouteDetails(routeId: string): Promise<RouteDetails> {
    const { createdByUser, ...route } =
      await this.findRouteWithAuthorById(routeId);

    const imagesOrdered =
      route.coverImageId != null
        ? [
            ...route.images.filter((img) => img.id === route.coverImageId),
            ...route.images.filter((img) => img.id !== route.coverImageId),
          ]
        : route.images;

    const imageUrls = await Promise.all(
      imagesOrdered.map((image) => this.resolveImageUrl(image.storageKey)),
    );

    const coverImageKey = route.images.find(
      (image) => image.id === route.coverImageId,
    )?.storageKey;

    const coverImageUrl = coverImageKey
      ? await this.resolveImageUrl(
          route.images.find((image) => image.id === route.coverImageId)!
            .storageKey,
        )
      : null;

    return toRouteView(route, createdByUser, {
      coverImageUrl,
      imageUrls,
    });
  }

  async getAllRoutes(): Promise<Route[]> {
    return this.prisma.route.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteRoute(routeId: string, userId: string): Promise<void> {
    await this.findOwnedRouteById(routeId, userId);

    await this.prisma.route.delete({
      where: { id: routeId },
    });
  }

  async createRouteImagePresignedUrl(
    routeId: string,
    userId: string,
    createRouteImagePresignedDto: CreateRouteImagePresignedDto,
  ): Promise<PresignedUrlResponse> {
    await this.findOwnedRouteById(routeId, userId);

    const imageId = randomUUID();
    const extension = createRouteImagePresignedDto.fileName.split('.').pop()!;
    const storageKey = this.storageService.buildRouteImageKey(
      routeId,
      imageId,
      extension,
    );

    const uploadUrl = await this.storageService.createPresignedUploadUrl({
      key: storageKey,
      contentType: createRouteImagePresignedDto.contentType,
    });

    return {
      uploadUrl,
      imageId,
      storageKey,
    };
  }

  async completeRouteImageUpload(
    routeId: string,
    userId: string,
    completeRouteImageUploadDto: CompleteRouteImageUploadDto,
  ): Promise<void> {
    await this.findOwnedRouteById(routeId, userId);

    const { imageId, storageKey } = completeRouteImageUploadDto;
    const isValidKey = storageKey.startsWith(`routes/${routeId}/images/`);

    if (!isValidKey) {
      throw new BadRequestException('Неправильний storage key');
    }

    const sortOrder =
      completeRouteImageUploadDto.sortOrder ??
      (await this.getNextRouteImageSortOrder(routeId));

    const data: Prisma.RouteImageUncheckedCreateInput = {
      id: imageId,
      routeId,
      storageKey,
      sortOrder,
      status: RouteImageStatus.APPROVED,
      uploadedByUserId: userId,
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.routeImage.create({ data });

      const route = await tx.route.findUnique({
        where: { id: routeId },
        select: { coverImageId: true },
      });

      if (!route?.coverImageId) {
        await tx.route.update({
          where: { id: routeId },
          data: { coverImageId: imageId },
        });
      }
    });
  }

  async setRouteCover(
    routeId: string,
    imageId: string,
    userId: string,
  ): Promise<void> {
    await this.findOwnedRouteById(routeId, userId);
    await this.findRouteImageOrThrow(routeId, imageId);

    await this.prisma.route.update({
      where: { id: routeId },
      data: { coverImageId: imageId },
    });
  }

  async deleteRouteImage(
    routeId: string,
    imageId: string,
    userId: string,
  ): Promise<void> {
    const route = await this.findOwnedRouteById(routeId, userId);
    const image = await this.findRouteImageOrThrow(routeId, imageId);

    await this.storageService.deleteObject(image.storageKey);

    await this.prisma.$transaction(async (tx) => {
      await tx.routeImage.delete({
        where: { id: imageId },
      });

      if (route.coverImageId !== imageId) {
        return;
      }

      const nextCover = await tx.routeImage.findFirst({
        where: { routeId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });

      await tx.route.update({
        where: { id: routeId },
        data: { coverImageId: nextCover?.id ?? null },
      });
    });
  }

  createRouteFromDraft(
    tx: Prisma.TransactionClient,
    draftRoute: RouteDraft,
    preview: RouteDraftPreview,
    finalizeRouteDto: FinalizeRouteDraftDto,
  ): Promise<Route> {
    const derived = calculateDerivedRouteValues(preview, finalizeRouteDto);
    const data = toRouteCreateInput(
      draftRoute,
      preview,
      finalizeRouteDto,
      derived,
    );

    return tx.route.create({
      data,
    });
  }

  async getGpxUrl(routeId: string, userId: string): Promise<string> {
    const route = await this.findOwnedRouteById(routeId, userId);

    if (!route.gpxStorageKey) {
      throw new NotFoundException('GPX-файл не знайдено');
    }

    return this.storageService.createPresignedDownloadUrl({
      key: route.gpxStorageKey,
    });
  }

  private findRouteById(routeId: string): Promise<Route> {
    const request = this.prisma.route.findUnique({ where: { id: routeId } });

    return this.findRouteOrThrow(request);
  }

  private async findOwnedRouteWithImagesById(
    routeId: string,
    userId: string,
  ): Promise<Route & { images: RouteImage[] }> {
    const route = await this.findRouteWithImagesById(routeId);

    this.checkRouteOwnership(route, userId);

    return route;
  }

  private findRouteWithAuthorById(
    routeId: string,
  ): Promise<Route & { createdByUser: User; images: RouteImage[] }> {
    const request = this.prisma.route.findUnique({
      where: { id: routeId },
      include: {
        createdByUser: true,
        images: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    return this.findRouteOrThrow(request);
  }

  private findRouteWithImagesById(
    routeId: string,
  ): Promise<Route & { images: RouteImage[] }> {
    const request = this.prisma.route.findUnique({
      where: { id: routeId },
      include: {
        images: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    return this.findRouteOrThrow(request);
  }

  private async findRouteOrThrow<T>(query: PromiseLike<T | null>): Promise<T> {
    const route = await query;

    if (!route) {
      throw new NotFoundException('Маршрут не знайдено');
    }

    return route;
  }

  private checkRouteOwnership(route: Route, userId: string): void {
    if (route.createdByUserId !== userId) {
      throw new ForbiddenException('Ви не маєте доступу до цього маршруту');
    }
  }

  private async findRouteImageOrThrow(
    routeId: string,
    imageId: string,
  ): Promise<RouteImage> {
    const image = await this.prisma.routeImage.findFirst({
      where: {
        id: imageId,
        routeId,
      },
    });

    if (!image) {
      throw new NotFoundException('Зображення не знайдено');
    }

    return image;
  }

  private async getNextRouteImageSortOrder(routeId: string): Promise<number> {
    const lastImage = await this.prisma.routeImage.findFirst({
      where: { routeId },
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
    });

    return lastImage ? lastImage.sortOrder + 1 : 0;
  }

  private async resolveImageUrl(storageKey: string): Promise<string> {
    return (
      this.storageService.getPublicUrl(storageKey) ??
      this.storageService.createPresignedDownloadUrl({
        key: storageKey,
      })
    );
  }
}
