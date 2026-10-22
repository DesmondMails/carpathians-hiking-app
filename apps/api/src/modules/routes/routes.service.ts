import { randomUUID } from 'node:crypto';

import {
  EditableRoute,
  PresignedUrlResponse,
  RouteDetails,
  RoutePoisResponse,
  RouteDraftPreview,
  RoutePoiEnrichmentStatusOptions,
  RouteListItem,
} from '@hiking/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  RouteWithPois,
  toEditableRoute,
  toRoutePoiView,
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

import { ROUTE_LIST_SELECT } from './constants';
import { CompleteRouteImageUploadDto } from './dto/complete-route-image-upload.dto';
import { CreateRouteImagePresignedDto } from './dto/create-route-image-presigned.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { SearchRouteQueryDto } from './dto/search-route-query.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { toRoutePoisResponse } from './mappers/route-view.mapper';
import { calculateDerivedRouteValues } from './utils/calculate-derived-route-values';
import { PoiEnrichmentService } from '../poi-enrichment/poi-enrichment.service';
import { FinalizeRouteDraftDto } from '../routes-draft/dto/finalize-route-draft.dto';
import { StorageService } from '../storage/storage.service';
import { selectFeaturedRoutePois } from './mappers/featured-route-pois';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private poiEnrichmentService: PoiEnrichmentService,
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

    const coverImageUrl = await this.resolveCoverImageUrl(route);

    return toRouteView(route, createdByUser, {
      coverImageUrl,
      imageUrls,
    });
  }

  async getRoutePois(routeId: string): Promise<RoutePoisResponse> {
    const route = await this.findRouteWithPoisById(routeId);

    return toRoutePoisResponse(route);
  }

  async getFeaturedRoutePois(routeId: string): Promise<RoutePoisResponse> {
    const enrichment =
      await this.poiEnrichmentService.getRoutePoiEnrichmentState(routeId);

    if (enrichment.status !== RoutePoiEnrichmentStatusOptions.READY) {
      return {
        ...enrichment,
        poiMarkers: [],
      };
    }

    const route = await this.findRouteWithPoisById(routeId);

    const featuredPois = selectFeaturedRoutePois(
      route.routePois,
      route.distanceM,
    ).map(toRoutePoiView);

    return {
      status: route.poiEnrichmentStatus,
      poiEnrichedFailedAt: route.poiEnrichedFailedAt?.toISOString() ?? null,
      poiMarkers: featuredPois,
    };
  }

  async scheduleRoutePoiEnrichment(routeId: string): Promise<void> {
    await this.poiEnrichmentService.scheduleRoutePoiEnrichment(routeId);
  }

  async getAllRoutes(
    searchQuery?: SearchRouteQueryDto,
  ): Promise<RouteListItem[]> {
    this.checkDistanceOrThrowErr(searchQuery);

    const routes = await this.prisma.route.findMany({
      where: {
        status: 'PUBLISHED',
        difficulty: searchQuery?.difficulty?.length
          ? {
              in: searchQuery?.difficulty,
            }
          : undefined,
        distanceM: {
          gte:
            searchQuery?.distanceFromM !== undefined
              ? searchQuery?.distanceFromM
              : undefined,
          lte: searchQuery?.distanceToM ? searchQuery?.distanceToM : undefined,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: ROUTE_LIST_SELECT,
    });

    return Promise.all(
      routes.map(async (route) => ({
        ...route,
        coverImageUrl: await this.resolveCoverImageUrl(route),
        createdAt: route.createdAt.toISOString(),
        updatedAt: route.updatedAt.toISOString(),
      })),
    );
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

  async getGpxUrl(routeId: string): Promise<string> {
    const route = await this.findRouteById(routeId);

    if (!route.gpxStorageKey) {
      throw new NotFoundException('GPX-файл не знайдено');
    }

    return this.storageService.createPresignedDownloadUrl({
      key: route.gpxStorageKey,
    });
  }

  async reEnrichRoutePois(routeId: string, userId: string): Promise<void> {
    const route = await this.findOwnedRouteById(routeId, userId);

    if (route.poiEnrichmentStatus !== RoutePoiEnrichmentStatusOptions.FAILED) {
      throw new BadRequestException('Маршрут не має статусу READY');
    }

    const enRichFailedLessThan10MinutesAgo =
      route.poiEnrichedFailedAt &&
      route.poiEnrichedFailedAt.getTime() > Date.now() - 10 * 60 * 1000;

    if (enRichFailedLessThan10MinutesAgo) {
      throw new BadRequestException(
        'Yе можна  менше шукати точки менш ніж через 10 хвилин після помилки',
      );
    }

    await this.poiEnrichmentService.scheduleRoutePoiEnrichment(routeId);
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

  private findRouteWithPoisById(routeId: string): Promise<RouteWithPois> {
    const request = this.prisma.route.findUnique({
      where: { id: routeId },
      include: {
        routePois: {
          include: { source: true },
          orderBy: { sortOrder: 'asc' },
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

  private async resolveCoverImageUrl(route: {
    coverImageId: string | null;
    images: RouteImage[];
  }): Promise<string | null> {
    if (!route.coverImageId) {
      return null;
    }

    const coverImage = route.images.find(
      (image) => image.id === route.coverImageId,
    );

    return coverImage ? this.resolveImageUrl(coverImage.storageKey) : null;
  }

  private async resolveImageUrl(storageKey: string): Promise<string> {
    return (
      this.storageService.getPublicUrl(storageKey) ??
      this.storageService.createPresignedDownloadUrl({
        key: storageKey,
      })
    );
  }

  private checkDistanceOrThrowErr(searchQuery?: SearchRouteQueryDto): void {
    const from = searchQuery?.distanceFromM;
    const to = searchQuery?.distanceToM;

    if (from === undefined || to === undefined) {
      return;
    }

    if (from > to) {
      throw new BadRequestException('Нижня межа має бути меншою, аніж верхня');
    }
  }
}
