import { HomeKindWithList, HomeResponse, RouteListItem } from '@hiking/shared';
import { Injectable, Logger } from '@nestjs/common';

import { RouteListRowWithSavedRoutes } from 'src/common/types';
import { Prisma } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  AMOUNT_OF_ITEMS_CAROUSEL_TO_SELECT,
  AMOUNT_OF_ITEMS_RECOMMENDATIONS_TO_SELECT,
  MIN_RADIUS_TO_START,
} from './constants';
import { AuthenticatedUser } from '../auth/interfaces';
import { GetHomeResponseDto } from './dto/get-home-response.dto';
import { ROUTE_LIST_SELECT } from '../routes/constants';
import { RoutesService } from '../routes/routes.service';

@Injectable()
export class HomeService {
  private logger = new Logger(HomeService.name);

  constructor(
    private prisma: PrismaService,
    private routesService: RoutesService,
  ) {}

  async getHomeLists(
    user: AuthenticatedUser,
    params: GetHomeResponseDto,
  ): Promise<HomeResponse> {
    const carousel = await this.prepareCarouselObject(user.id, params);

    const routesToExcludeFromRecommendations = this.getCarouselRouteIds(
      carousel.routes,
    );

    const recommendations = await this.prepareRecommendationsObject(
      user.id,
      routesToExcludeFromRecommendations,
    );

    const homeResponse: HomeResponse = {
      carousel,
      recommendations,
    };

    return homeResponse;
  }

  private async prepareRecommendationsObject(
    userId: string,
    routesToExcludeFromRecommendations: string[],
  ): Promise<HomeKindWithList> {
    //In the future after release will be possible system with recommendations
    const kind = 'ideas';

    const rawRoutes = await this.findHomeRoutes(
      userId,
      [],
      AMOUNT_OF_ITEMS_RECOMMENDATIONS_TO_SELECT,
      routesToExcludeFromRecommendations,
    );

    const twoRandomElements = this.pickRandomElements(rawRoutes, 2);

    const routes = await this.prepareHomeList(twoRandomElements);

    return {
      kind,
      routes,
    };
  }

  private async prepareCarouselObject(
    userId: string,
    params: GetHomeResponseDto,
  ): Promise<HomeKindWithList> {
    const isCoordsPresent = !!params?.latitude && !!params?.longitude;

    let nearRouteIds: string[] = [];

    if (isCoordsPresent) {
      nearRouteIds = await this.routesService.searchNearbyRoutes(
        params.longitude!,
        params.latitude!,
        MIN_RADIUS_TO_START,
      );
    }

    const kind = nearRouteIds?.length > 0 ? 'nearby' : 'recent';

    this.logger.log('nearRouteIds', nearRouteIds);

    const routes = await this.getCarouselList(userId, nearRouteIds);

    return {
      kind,
      routes,
    };
  }

  private async getCarouselList(
    userId: string,
    nearRouteIds: string[],
  ): Promise<RouteListItem[]> {
    const routesToSearch = await this.findHomeRoutes(userId, nearRouteIds);

    const orderedRoutes =
      nearRouteIds.length > 0
        ? this.restoreOrderByIds(routesToSearch, nearRouteIds)
        : routesToSearch;

    const routesList = await this.prepareHomeList(orderedRoutes);

    return routesList;
  }

  // `ids` narrows the list (e.g. to nearby routes); without it the latest
  // routes are returned. `isSaved` is resolved for `userId` only.
  private findHomeRoutes(
    userId: string,
    ids?: string[],
    amountToTake = AMOUNT_OF_ITEMS_CAROUSEL_TO_SELECT,
    idsToExclude?: string[],
  ): Promise<RouteListRowWithSavedRoutes[]> {
    const searchByIds = ids && ids.length > 0;

    const idFilter = this.buildIdFilter(ids, idsToExclude, amountToTake);

    return this.prisma.route.findMany({
      where: {
        id: idFilter,
        status: 'PUBLISHED',
      },

      orderBy: !searchByIds ? { createdAt: 'desc' } : undefined,
      //TODO: There should be additional param for rating
      take: amountToTake,
      select: {
        ...ROUTE_LIST_SELECT,
        savedRoutes: {
          where: { userId },
          select: { userId: true },
        },
      },
    });
  }

  // `ids` takes priority over `idsToExclude`: a list narrowed to specific ids
  // has nothing left to exclude
  private buildIdFilter(
    ids?: string[],
    idsToExclude?: string[],
    amountToTake = AMOUNT_OF_ITEMS_CAROUSEL_TO_SELECT,
  ): Prisma.RouteWhereInput['id'] {
    if (ids && ids.length > 0) {
      return { in: ids.slice(0, amountToTake) };
    }

    if (idsToExclude && idsToExclude.length > 0) {
      return { notIn: idsToExclude };
    }

    return undefined;
  }

  // `findMany` with `id IN (...)` does not keep the order of `ids`, so the
  // distance order from the KNN query is restored here. Ids without a row
  // (not fetched or unpublished in between) are skipped
  private restoreOrderByIds<T extends { id: string }>(
    items: T[],
    ids: string[],
  ): T[] {
    const itemsById = new Map(items.map((item) => [item.id, item]));

    return ids.flatMap((id) => {
      const item = itemsById.get(id);

      return item ? [item] : [];
    });
  }

  // Partial Fisher–Yates shuffle: every element has the same chance to be
  // picked, and `items` itself is not mutated
  private pickRandomElements<T>(items: T[], count: number): T[] {
    const pool = [...items];
    const amount = Math.min(count, pool.length);

    for (let i = 0; i < amount; i++) {
      const j = i + Math.floor(Math.random() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool.slice(0, amount);
  }

  private async prepareHomeList(
    routes: RouteListRowWithSavedRoutes[],
  ): Promise<RouteListItem[]> {
    const routeList = await this.routesService.toRouteListItems(
      routes.map(({ savedRoutes, ...route }) => ({
        ...route,
        isSaved: savedRoutes.length > 0,
      })),
    );

    return routeList;
  }

  private getCarouselRouteIds(routes: RouteListItem[]): string[] {
    return routes.map((route) => route.id);
  }
}
