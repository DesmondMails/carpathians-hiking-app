import { randomUUID } from 'node:crypto';

import { PresignedUrlResponse } from '@hiking/shared';
import {
  BadRequestException,
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
  RouteDraftImage,
  RouteDraftStatus,
  RouteImageStatus,
} from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { CompleteDraftImageUploadDto } from './dto/complete-image-upload.dto';
import { CreateRouteDraftDto } from './dto/create-route-draft.dto';
import { FinalizeRouteDraftDto } from './dto/finalize-route-draft.dto';
import { UpdateRouteDraftDto } from './dto/update-route-draft.dto';
import { RoutesService } from '../routes/routes.service';
import { GpxParserService } from './gpx/gpx-parser.service';
import { parsePreview } from './utils/parse-preview';
import { StorageService } from '../storage/storage.service';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';

@Injectable()
export class RoutesDraftService {
  private readonly logger = new Logger(RoutesDraftService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly routesService: RoutesService,
    private readonly gpxParserService: GpxParserService,
    private readonly storageService: StorageService,
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

    const allDraftImages = await this.prisma.routeDraftImage.findMany({
      where: { draftId: routeDraftId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    const selectedDraftImages = this.resolveSelectedDraftImages(
      allDraftImages,
      finalizeRouteDraftDto.imageIds,
    );
    const coverImageId = this.resolveCoverImageId(
      selectedDraftImages,
      finalizeRouteDraftDto.coverImageId,
    );

    const route = await this.prisma.$transaction(async (tx) => {
      const createdRoute = await this.routesService.createRouteFromDraft(
        tx,
        routeDraft,
        preview,
        {
          ...finalizeRouteDraftDto,
          coverImageId,
        },
      );

      if (selectedDraftImages.length > 0) {
        await tx.routeImage.createMany({
          data: selectedDraftImages.map((image, index) => ({
            id: image.id,
            routeId: createdRoute.id,
            storageKey: image.storageKey,
            status: RouteImageStatus.APPROVED,
            sortOrder: index,
            uploadedByUserId: userId,
          })),
        });
      }

      await tx.routeDraft.update({
        where: { id: routeDraftId },
        data: {
          status: RouteDraftStatus.FINALIZED,
        },
      });

      await tx.routeDraftImage.deleteMany({
        where: { draftId: routeDraftId },
      });

      return createdRoute;
    });

    return route;
  }

  async createRouteDraftFromGpx(
    userId: string,
    file: Express.Multer.File,
  ): Promise<RouteDraft> {
    const parsedGpx = await this.gpxParserService.parseGpx(file);

    const fileName = (file as { originalname: string }).originalname;

    const title = this.extractTitleFromFileName(fileName);

    const createRouteDraftData: Prisma.RouteDraftUncheckedCreateInput = {
      sourceFileName: fileName,
      title,
      createdByUserId: userId,
      status: RouteDraftStatus.READY,
      previewJson: toPreviewJson(parsedGpx),
    };

    const routeDraft = await this.prisma.routeDraft.create({
      data: createRouteDraftData,
    });

    const gpxStorageKey = await this.uploadGpxToStorage(
      userId,
      routeDraft.id,
      file,
    );

    return this.prisma.routeDraft.update({
      where: { id: routeDraft.id },
      data: {
        gpxStorageKey,
      },
    });
  }

  async createPresignedUrl(
    routeDraftId: string,
    userId: string,
    createPresignedUrlDto: CreatePresignedUrlDto,
  ): Promise<PresignedUrlResponse> {
    await this.findOwnedRouteDraftById(routeDraftId, userId);

    const generatedId = randomUUID();

    const extension = createPresignedUrlDto.fileName.split('.').pop()!;

    const key = this.storageService.buildDraftImageKey(
      routeDraftId,
      generatedId,
      extension,
    );

    const uploadUrl = await this.storageService.createPresignedUploadUrl({
      key,
      contentType: createPresignedUrlDto.contentType,
    });

    return {
      uploadUrl,
      imageId: generatedId,
      storageKey: key,
    };
  }

  async completeDraftImageUpload(
    routeDraftId: string,
    userId: string,
    completeDraftImageUploadDto: CompleteDraftImageUploadDto,
  ): Promise<void> {
    await this.findOwnedRouteDraftById(routeDraftId, userId);

    const { imageId, storageKey, sortOrder } = completeDraftImageUploadDto;

    const isValidKey = storageKey.startsWith(`drafts/${routeDraftId}/images/`);

    if (!isValidKey) {
      throw new BadRequestException('Неправильний storage key');
    }

    const data: Prisma.RouteDraftImageUncheckedCreateInput = {
      id: imageId,
      draftId: routeDraftId,
      storageKey,
      sortOrder,
    };

    await this.prisma.routeDraftImage.create({
      data,
    });
  }

  async deleteRouteDraftImage(
    routeDraftId: string,
    imageId: string,
    userId: string,
  ): Promise<void> {
    await this.findOwnedRouteDraftById(routeDraftId, userId);

    const image = await this.prisma.routeDraftImage.findFirst({
      where: {
        id: imageId,
        draftId: routeDraftId,
      },
    });

    if (!image) {
      throw new NotFoundException('Зображення не знайдено');
    }

    await this.storageService.deleteObject(image.storageKey);

    await this.prisma.routeDraftImage.delete({
      where: { id: imageId },
    });
  }

  private resolveSelectedDraftImages(
    draftImages: RouteDraftImage[],
    imageIds?: string[],
  ): RouteDraftImage[] {
    if (!imageIds || imageIds.length === 0) {
      return [];
    }

    const uniqueImageIds = [...new Set(imageIds)];

    if (uniqueImageIds.length !== imageIds.length) {
      throw new BadRequestException('Список зображень містить дублікати');
    }

    const draftImagesById = new Map(
      draftImages.map((image) => [image.id, image]),
    );

    const selectedDraftImages = uniqueImageIds.map((imageId) => {
      const draftImage = draftImagesById.get(imageId);

      if (!draftImage) {
        throw new BadRequestException(
          `Зображення "${imageId}" не належить цьому draft`,
        );
      }

      return draftImage;
    });

    return selectedDraftImages;
  }

  private resolveCoverImageId(
    selectedDraftImages: RouteDraftImage[],
    requestedCoverImageId?: string,
  ): string | undefined {
    if (!requestedCoverImageId) {
      return selectedDraftImages[0]?.id;
    }

    const isCoverSelected = selectedDraftImages.some(
      (image) => image.id === requestedCoverImageId,
    );

    if (!isCoverSelected) {
      throw new BadRequestException(
        'Обкладинка маршруту не знайдена в списку зображень',
      );
    }

    return requestedCoverImageId;
  }

  private checkRouteDraftOwnership(
    routeDraft: RouteDraft,
    userId: string,
  ): void {
    if (routeDraft.createdByUserId !== userId) {
      throw new ForbiddenException('Ви не маєте доступу до цього draft');
    }
  }

  private async uploadGpxToStorage(
    userId: string,
    routeDraftId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const gpxStorageKey = this.storageService.buildDraftGpxKey(
      userId,
      routeDraftId,
    );

    await this.storageService.putObject({
      key: gpxStorageKey,
      body: file.buffer,
      contentType: file.mimetype,
      contentLength: file.size,
    });

    return gpxStorageKey;
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
