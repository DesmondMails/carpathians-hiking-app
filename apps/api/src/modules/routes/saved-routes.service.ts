import { DEFAULT_LIMIT, DEFAULT_OFFSET, RouteListItem } from '@hiking/shared';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { Prisma, SavedRoute } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { ROUTE_LIST_SELECT } from './constants';
import { SavedRouteQueryDto } from './dto/saved-route-query.dto';
import { RoutesService } from './routes.service';

@Injectable()
export class SavedRoutesService {
  private logger = new Logger(SavedRoutesService.name);

  constructor(
    private prisma: PrismaService,
    private routesService: RoutesService,
  ) {}

  async getSavedRoutes(
    userId: string,
    savedRoutesQuery: SavedRouteQueryDto,
  ): Promise<RouteListItem[]> {
    const { limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET } =
      savedRoutesQuery ?? {};

    const savedRoutes = await this.prisma.savedRoute.findMany({
      where: {
        userId,
        route: { status: 'PUBLISHED' },
      },
      orderBy: [{ savedAt: 'desc' }, { routeId: 'desc' }],
      select: {
        route: { select: ROUTE_LIST_SELECT },
      },
      take: limit,
      skip: offset,
    });

    return this.routesService.toRouteListItems(
      savedRoutes.map(({ route }) => ({ ...route, isSaved: true })),
    );
  }

  async saveRoute(routeId: string, userId: string): Promise<SavedRoute> {
    this.logger.log(`Trying to save route ${routeId} for user: ${userId}`);

    await this.ensureRouteIsPublished(routeId);

    try {
      return await this.upsertSavedRoute(routeId, userId);
    } catch (error) {
      return this.handleSaveError(error, routeId, userId);
    }
  }

  async deleteSaving(routeId: string, userId: string): Promise<void> {
    await this.prisma.savedRoute.deleteMany({
      where: { routeId, userId },
    });
  }

  private async ensureRouteIsPublished(routeId: string): Promise<void> {
    const route = await this.prisma.route.findFirst({
      where: { id: routeId, status: 'PUBLISHED' },
      select: { id: true },
    });

    if (!route) {
      throw new NotFoundException('Маршрут не знайдено або недоступний');
    }
  }

  private upsertSavedRoute(
    routeId: string,
    userId: string,
  ): Promise<SavedRoute> {
    return this.prisma.savedRoute.upsert({
      where: { routeId_userId: { routeId, userId } },
      create: { routeId, userId },
      update: {},
    });
  }

  private async handleSaveError(
    error: unknown,
    routeId: string,
    userId: string,
  ): Promise<SavedRoute> {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const savedRoute = await this.prisma.savedRoute.findUnique({
          where: {
            routeId_userId: { routeId, userId },
            route: { status: 'PUBLISHED' },
          },
        });

        if (savedRoute) return savedRoute;
      }

      if (error.code === 'P2003') {
        throw new NotFoundException('Маршрут не знайдено або недоступний');
      }
    }

    throw error;
  }
}
