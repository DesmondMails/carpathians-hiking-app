import { RouteDetails, RouteDraftPreview } from '@hiking/shared';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { toRouteCreateInput, toRouteView } from 'src/modules/routes/mappers';
import { Prisma, Route, RouteDraft, User } from 'src/prisma/generated/client';
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

    return toRouteView(route, createdByUser);
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
    draftRoute: RouteDraft,
    preview: RouteDraftPreview,
    finalizeRouteDto: FinalizeRouteDraftDto,
  ): Prisma.PrismaPromise<Route> {
    const derived = calculateDerivedRouteValues(preview, finalizeRouteDto);
    const data = toRouteCreateInput(
      draftRoute,
      preview,
      finalizeRouteDto,
      derived,
    );

    return this.prisma.route.create({
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
  ): Promise<Route & { createdByUser: User }> {
    const request = this.prisma.route.findUnique({
      where: { id: routeId },
      include: { createdByUser: true },
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
}
