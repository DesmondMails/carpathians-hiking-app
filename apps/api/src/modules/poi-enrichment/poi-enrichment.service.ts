import { createHash } from 'node:crypto';

import type {
  RouteCoordinate,
  RoutePoiEnrichmentStatus,
  RoutePoisResponse,
} from '@hiking/shared';
import {
  RoutePoiEnrichmentStatusOptions,
  type RoutePoiConfidence,
} from '@hiking/shared';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { asCoordinates } from 'src/common/utils/json-guards';
import { Prisma } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { OverpassClientService } from './overpass-client.service';
import {
  PersistablePoiCandidate,
  NormalizedPoiCandidate,
} from './poi-enrichment.types';
import { PoiNormalizerService } from './poi-normalizer.service';
import { PoiRouteGeometryService } from './poi-route-geometry.service';
import { toRoutePoisResponse } from '../routes/mappers/route-view.mapper';

const OVERPASS_BBOX_PADDING_M = 500;
const MAX_DISTANCE_FROM_ROUTE_M = 350;
const FALLBACK_BUILDING_MAX_DISTANCE_M = 150;
const NEARBY_DEDUP_DISTANCE_M = 30;
const GENERIC_POI_LABELS = [
  'Shelter',
  'Water',
  'Camp site',
  'Camp pitch',
  'Wild camp',
  'Basic camp',
  'Peak',
  'Viewpoint',
];

@Injectable()
export class PoiEnrichmentService {
  private readonly logger = new Logger(PoiEnrichmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly overpassClient: OverpassClientService,
    private readonly poiNormalizer: PoiNormalizerService,
    private readonly poiGeometry: PoiRouteGeometryService,
  ) {}

  scheduleRoutePoiEnrichment(routeId: string): void {
    setImmediate(() => {
      void this.enrichRoutePois(routeId);
    });
  }

  async getRoutePois(routeId: string): Promise<RoutePoisResponse> {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: {
        routePois: {
          include: { source: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!route) {
      throw new NotFoundException('Маршрут не знайдено');
    }

    return toRoutePoisResponse(route);
  }

  async enrichRoutePois(routeId: string): Promise<void> {
    try {
      await this.markRouteEnrichmentPending(routeId);

      const route = await this.prisma.route.findUnique({
        where: { id: routeId },
        select: {
          id: true,
          routeCoordinatesJson: true,
        },
      });

      if (!route) {
        throw new NotFoundException('Маршрут не знайдено');
      }

      const routeCoordinates = asCoordinates(route.routeCoordinatesJson) ?? [];

      if (routeCoordinates.length < 2) {
        throw new Error(
          'Маршрут не має достатньої геометрії для POI enrichment',
        );
      }

      const bbox = this.poiGeometry.buildExpandedBbox(
        routeCoordinates,
        OVERPASS_BBOX_PADDING_M,
      );

      if (bbox === null) {
        throw new Error('Не вдалося побудувати bbox для маршруту');
      }

      const rawElements = await this.overpassClient.fetchPoiElements(bbox);

      const candidates = rawElements
        .map((element) => this.poiNormalizer.normalizeElement(element))
        .filter(
          (candidate): candidate is NormalizedPoiCandidate =>
            candidate !== null,
        );

      const normalizedCandidates = this.deduplicateExactCandidates(candidates);
      const persistableCandidates = this.prepareCandidatesForPersistence(
        routeCoordinates,
        normalizedCandidates,
      );

      await this.persistRoutePois(routeId, persistableCandidates);

      this.logger.log(
        `POI enrichment completed for route=${routeId}, persisted=${persistableCandidates.length}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `POI enrichment failed for route=${routeId}: ${message}`,
      );

      await this.prisma.route.updateMany({
        where: { id: routeId },
        data: {
          poiEnrichmentStatus: RoutePoiEnrichmentStatusOptions.FAILED,
          poiEnrichmentError: message.slice(0, 500),
        },
      });
    }
  }

  async getRoutePoiEnrichmentStatus(
    routeId: string,
  ): Promise<RoutePoiEnrichmentStatus> {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      select: {
        poiEnrichmentStatus: true,
      },
    });

    if (!route) {
      throw new NotFoundException('Маршрут не знайдено');
    }

    return route.poiEnrichmentStatus;
  }

  private async markRouteEnrichmentPending(routeId: string): Promise<void> {
    await this.prisma.route.update({
      where: { id: routeId },
      data: {
        poiEnrichmentStatus: RoutePoiEnrichmentStatusOptions.PENDING,
        poiEnrichmentError: null,
      },
    });
  }

  private deduplicateExactCandidates(
    candidates: NormalizedPoiCandidate[],
  ): NormalizedPoiCandidate[] {
    const seen = new Set<string>();
    const result: NormalizedPoiCandidate[] = [];

    for (const candidate of candidates) {
      const key = `${candidate.provider}:${candidate.osmType}:${candidate.osmId}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      result.push(candidate);
    }

    return result;
  }

  private prepareCandidatesForPersistence(
    routeCoordinates: RouteCoordinate[],
    candidates: NormalizedPoiCandidate[],
  ): PersistablePoiCandidate[] {
    const measured = candidates
      .map((candidate) => {
        const metrics = this.poiGeometry.measurePoiDistanceMetrics(
          routeCoordinates,
          candidate.latitude,
          candidate.longitude,
        );

        if (metrics === null) {
          return null;
        }

        const scored = this.applyScoring(candidate, metrics.distanceFromRouteM);

        return {
          ...candidate,
          ...metrics,
          score: scored.score,
          confidence: scored.confidence,
        };
      })
      .filter(
        (candidate): candidate is PersistablePoiCandidate => candidate !== null,
      )
      .filter(
        (candidate) =>
          candidate.distanceFromRouteM <= MAX_DISTANCE_FROM_ROUTE_M,
      )
      .filter((candidate) => this.passesFallbackDistanceRule(candidate));

    const deduped = this.deduplicateNearbyCandidates(measured);

    return deduped
      .sort((left, right) => left.distanceFromStartM - right.distanceFromStartM)
      .map((candidate, index) => ({
        ...candidate,
        score: candidate.score,
        metadata: {
          ...candidate.metadata,
          persistedOrder: index,
        },
      }));
  }

  private applyScoring(
    candidate: NormalizedPoiCandidate,
    distanceFromRouteM: number,
  ): { confidence: RoutePoiConfidence; score: number } {
    let confidence = candidate.confidence;
    let score = this.toConfidenceScore(confidence);

    if (distanceFromRouteM <= 75) {
      score += 4;
    } else if (distanceFromRouteM <= 150) {
      score += 2;
    }

    if (!GENERIC_POI_LABELS.includes(candidate.label)) {
      score += 2;
    }

    if (candidate.access === 'PRIVATE') {
      confidence = this.downgradeConfidence(confidence);
      score -= 2;
    }

    if (candidate.type === 'WATER' && candidate.waterPotability === 'UNKNOWN') {
      confidence = this.downgradeConfidence(confidence);
      score -= 1;
    }

    if (
      candidate.type === 'SHELTER' &&
      (candidate.subtype === 'building_hut' ||
        candidate.subtype === 'building_cabin') &&
      !candidate.metadata.fallbackBuildingName
    ) {
      confidence = this.downgradeConfidence(confidence);
      score -= 2;
    }

    return { confidence, score };
  }

  private passesFallbackDistanceRule(
    candidate: PersistablePoiCandidate,
  ): boolean {
    if (
      candidate.subtype === 'building_hut' ||
      candidate.subtype === 'building_cabin'
    ) {
      return candidate.distanceFromRouteM <= FALLBACK_BUILDING_MAX_DISTANCE_M;
    }

    return true;
  }

  private deduplicateNearbyCandidates(
    candidates: PersistablePoiCandidate[],
  ): PersistablePoiCandidate[] {
    const sorted = [...candidates].sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.distanceFromRouteM - right.distanceFromRouteM;
    });

    const kept: PersistablePoiCandidate[] = [];

    for (const candidate of sorted) {
      const hasNearbyDuplicate = kept.some((existing) => {
        if (existing.type !== candidate.type) {
          return false;
        }

        const distance = this.poiGeometry.distanceBetweenPointsM(
          existing,
          candidate,
        );

        return distance <= NEARBY_DEDUP_DISTANCE_M;
      });

      if (!hasNearbyDuplicate) {
        kept.push(candidate);
      }
    }

    return kept;
  }

  private toConfidenceScore(confidence: RoutePoiConfidence): number {
    switch (confidence) {
      case 'HIGH':
        return 30;
      case 'MEDIUM':
        return 20;
      case 'LOW':
      default:
        return 10;
    }
  }

  private downgradeConfidence(
    confidence: RoutePoiConfidence,
  ): RoutePoiConfidence {
    switch (confidence) {
      case 'HIGH':
        return 'MEDIUM';
      case 'MEDIUM':
        return 'LOW';
      case 'LOW':
      default:
        return 'LOW';
    }
  }

  private async persistRoutePois(
    routeId: string,
    candidates: PersistablePoiCandidate[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.routePoi.deleteMany({
        where: { routeId },
      });

      for (let index = 0; index < candidates.length; index += 1) {
        const candidate = candidates[index];
        const fetchedAt = new Date();

        const source = await tx.routePoiSource.upsert({
          where: {
            provider_osmType_osmId: {
              provider: candidate.provider,
              osmType: candidate.osmType,
              osmId: candidate.osmId,
            },
          },
          create: {
            provider: candidate.provider,
            osmType: candidate.osmType,
            osmId: candidate.osmId,
            rawTagsJson: candidate.rawTags as Prisma.InputJsonValue,
            rawGeometryCenterJson:
              candidate.rawGeometryCenter as unknown as Prisma.InputJsonValue,
            fetchedAt,
            hash: this.buildSourceHash(candidate),
          },
          update: {
            rawTagsJson: candidate.rawTags as Prisma.InputJsonValue,
            rawGeometryCenterJson:
              candidate.rawGeometryCenter as unknown as Prisma.InputJsonValue,
            fetchedAt,
            hash: this.buildSourceHash(candidate),
          },
        });

        await tx.routePoi.create({
          data: {
            routeId,
            sourceId: source.id,
            type: candidate.type,
            subtype: candidate.subtype,
            label: candidate.label,
            latitude: candidate.latitude,
            longitude: candidate.longitude,
            distanceFromRouteM: candidate.distanceFromRouteM,
            distanceFromStartM: candidate.distanceFromStartM,
            confidence: candidate.confidence,
            waterPotability: candidate.waterPotability,
            access: candidate.access,
            sortOrder: index,
            metadataJson:
              candidate.metadata as unknown as Prisma.InputJsonValue,
          },
        });
      }

      await tx.route.update({
        where: { id: routeId },
        data: {
          poiEnrichmentStatus: RoutePoiEnrichmentStatusOptions.READY,
          poiEnrichmentError: null,
          poiEnrichedAt: new Date(),
        },
      });
    });
  }

  private buildSourceHash(candidate: PersistablePoiCandidate): string {
    return createHash('sha1')
      .update(
        JSON.stringify({
          provider: candidate.provider,
          osmType: candidate.osmType,
          osmId: candidate.osmId,
          rawTags: candidate.rawTags,
        }),
      )
      .digest('hex');
  }
}
