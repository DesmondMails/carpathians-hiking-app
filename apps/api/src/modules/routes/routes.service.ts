import { RouteDraftPreview } from '@hiking/shared';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { toRouteCreateInput } from 'src/common/mappers/route-creation';
import { Prisma, Route, RouteDraft } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { FinalizeRouteDraftDto } from '../routes-draft/dto/finalize-route-draft.dto';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(private prisma: PrismaService) {}

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

  async findRouteById(routeId: string): Promise<Route> {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      throw new NotFoundException('Маршрут не знайдено');
    }

    return route;
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
    const data = toRouteCreateInput(draftRoute, preview, finalizeRouteDto);

    return this.prisma.route.create({
      data,
    });
  }

  private checkRouteOwnership(route: Route, userId: string): void {
    if (route.createdByUserId !== userId) {
      throw new ForbiddenException('Ви не маєте доступу до цього маршруту');
    }
  }
}
