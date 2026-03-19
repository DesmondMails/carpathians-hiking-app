import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Route } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
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

  private checkRouteOwnership(route: Route, userId: string): void {
    if (route.createdByUserId !== userId) {
      throw new ForbiddenException('Ви не маєте доступу до цього маршруту');
    }
  }
}
