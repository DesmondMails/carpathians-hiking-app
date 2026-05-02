import { RouteDetails, RouteDraftPreview } from '@hiking/shared';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { toRouteCreateInput, toRouteView } from 'src/modules/routes/mappers';
import {
  Prisma,
  Route,
  RouteDraft,
  RouteImage,
  User,
} from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

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

  private async resolveImageUrl(storageKey: string): Promise<string> {
    return (
      this.storageService.getPublicUrl(storageKey) ??
      this.storageService.createPresignedDownloadUrl({
        key: storageKey,
      })
    );
  }
}
