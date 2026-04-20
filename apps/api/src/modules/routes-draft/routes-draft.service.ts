import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { RouteDraft, RouteDraftStatus } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateRouteDraftDto } from './dto/create-route-draft.dto';
import { FinalizeRouteDraftDto } from './dto/finalize-route-draft.dto';
import { UpdateRouteDraftDto } from './dto/update-route-draft.dto';
import { RoutesService } from '../routes/routes.service';
import { GpxParserService } from './gpx/gpx-parser.service';

@Injectable()
export class RoutesDraftService {
  private readonly logger = new Logger(RoutesDraftService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly routesService: RoutesService,
    private readonly gpxParserService: GpxParserService,
  ) {}

  async createRouteDraft(
    userId: string,
    createRouteDraftDto: CreateRouteDraftDto,
  ): Promise<RouteDraft> {
    const data = {
      ...createRouteDraftDto,
      status: RouteDraftStatus.PROCESSING,
      createdByUserId: userId,
    };

    this.logger.log(
      `Creating route draft for user ${userId}: ${JSON.stringify(data)}`,
    );

    return this.prisma.routeDraft.create({
      data,
    });
  }

  async updateRouteDraft(
    userId: string,
    routeDraftId: string,
    updateRouteDraftDto: UpdateRouteDraftDto,
  ): Promise<RouteDraft> {
    await this.findOwnedRouteDraftById(routeDraftId, userId);

    return this.prisma.routeDraft.update({
      where: { id: routeDraftId },
      data: updateRouteDraftDto,
    });
  }

  async findOwnedRouteDraftById(
    routeDraftId: string,
    userId: string,
  ): Promise<RouteDraft> {
    const routeDraft = await this.findRouteDraftById(routeDraftId);

    this.checkRouteDraftOwnership(routeDraft, userId);

    return routeDraft;
  }

  async findRouteDraftById(routeDraftId: string): Promise<RouteDraft> {
    const route = await this.prisma.routeDraft.findUnique({
      where: { id: routeDraftId },
    });

    if (!route) {
      throw new NotFoundException('Draft маршрут не знайдено');
    }

    return route;
  }

  async deleteRouteDraft(routeDraftId: string, userId: string): Promise<void> {
    await this.findOwnedRouteDraftById(routeDraftId, userId);

    await this.prisma.routeDraft.delete({
      where: { id: routeDraftId },
    });
  }

  async finalizeRouteDraft(
    routeDraftId: string,
    userId: string,
    finalizeRouteDraftDto: FinalizeRouteDraftDto,
  ): Promise<void> {
    const routeDraft = await this.findOwnedRouteDraftById(routeDraftId, userId);

    const data = {
      ...routeDraft,
      ...finalizeRouteDraftDto,
      status: RouteDraftStatus.FINALIZED,
    };

    this.logger.log(
      `Finalizing route draft ${routeDraftId} for user ${userId}: ${JSON.stringify(data)}`,
    );
    this.logger.log(`Route draft preview: ${JSON.stringify(data.previewJson)}`);

    this.routesService.createRouteFromDraft(data, userId);
  }

  createRouteDraftFromGpx(userId: string, file: Express.Multer.File): void {
    this.gpxParserService.parseGpx(file);
  }

  private checkRouteDraftOwnership(
    routeDraft: RouteDraft,
    userId: string,
  ): void {
    if (routeDraft.createdByUserId !== userId) {
      throw new ForbiddenException('Ви не маєте доступу до цього draft');
    }
  }
}
