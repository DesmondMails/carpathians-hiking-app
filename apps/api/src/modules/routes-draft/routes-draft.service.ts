import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { toPreviewJson } from 'src/common/mappers';
import {
  Prisma,
  Route,
  RouteDraft,
  RouteDraftStatus,
} from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateRouteDraftDto } from './dto/create-route-draft.dto';
import { FinalizeRouteDraftDto } from './dto/finalize-route-draft.dto';
import { UpdateRouteDraftDto } from './dto/update-route-draft.dto';
import { RoutesService } from '../routes/routes.service';
import { GpxParserService } from './gpx/gpx-parser.service';
import { parsePreview } from './utils/parse-preview';

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
  ): Promise<Route> {
    const routeDraft = await this.findOwnedRouteDraftById(routeDraftId, userId);

    this.checkIfAllreadyFinalized(routeDraft);

    const preview = parsePreview(routeDraft.previewJson);

    const [route] = await this.prisma.$transaction([
      this.routesService.createRouteFromDraft(
        routeDraft,
        preview,
        finalizeRouteDraftDto,
      ),
      this.prisma.routeDraft.update({
        where: { id: routeDraftId },
        data: {
          status: RouteDraftStatus.FINALIZED,
        },
      }),
    ]);

    return route;
  }

  createRouteDraftFromGpx(
    userId: string,
    file: Express.Multer.File,
  ): Promise<RouteDraft> {
    const parsedGpx = this.gpxParserService.parseGpx(file);

    const fileName = (file as { originalname: string }).originalname;

    const title = this.extractTitleFromFileName(fileName);

    const createRouteDraftData: Prisma.RouteDraftUncheckedCreateInput = {
      sourceFileName: fileName,
      title,
      createdByUserId: userId,
      status: RouteDraftStatus.READY,
      previewJson: toPreviewJson(parsedGpx),
    };

    return this.prisma.routeDraft.create({
      data: createRouteDraftData,
    });
  }

  private checkRouteDraftOwnership(
    routeDraft: RouteDraft,
    userId: string,
  ): void {
    if (routeDraft.createdByUserId !== userId) {
      throw new ForbiddenException('Ви не маєте доступу до цього draft');
    }
  }

  private checkIfAllreadyFinalized(routeDraft: RouteDraft): void {
    if (routeDraft.status === RouteDraftStatus.FINALIZED) {
      throw new ConflictException('Draft маршрут вже завершено');
    }
  }

  private extractTitleFromFileName(fileName: string): string {
    return fileName.split('.').slice(0, -1).join(' ');
  }
}
