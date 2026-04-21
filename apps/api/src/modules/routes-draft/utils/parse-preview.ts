import type {
  RouteDraftPreview,
  RouteDraftPreviewCoordinate,
} from '@hiking/shared';
import { BadRequestException } from '@nestjs/common';

import type { Difficulty, Prisma } from 'src/prisma/generated/client';

function isObject(
  value: Prisma.JsonValue | null | undefined,
): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asNumber(value: Prisma.JsonValue | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function asString(value: Prisma.JsonValue | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asDifficulty(
  value: Prisma.JsonValue | undefined,
): Difficulty | undefined {
  if (
    value === 'EASY' ||
    value === 'MODERATE' ||
    value === 'HARD' ||
    value === 'EXTREME'
  ) {
    return value;
  }
  return undefined;
}

function asCoordinates(
  value: Prisma.JsonValue | undefined,
): RouteDraftPreviewCoordinate[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const result: NonNullable<RouteDraftPreviewCoordinate[]> = [];

  for (const item of value) {
    if (!isObject(item)) continue;

    const latitude = asNumber(item.latitude);
    const longitude = asNumber(item.longitude);
    const elevationRaw = item.elevationM;
    const elevationM = elevationRaw === null ? null : asNumber(elevationRaw);

    if (latitude === undefined || longitude === undefined) continue;

    result.push({
      latitude,
      longitude,
      elevationM: elevationM ?? 0,
    });
  }

  return result.length ? result : undefined;
}

export function parsePreview(
  previewJson: Prisma.JsonValue | null,
): RouteDraftPreview {
  if (!isObject(previewJson)) {
    throw new BadRequestException('Draft previewJson має бути обʼєктом');
  }

  const version = asNumber(previewJson.version);
  if (version !== 1) {
    throw new BadRequestException('Непідтримувана версія previewJson');
  }

  const parsed: RouteDraftPreview = {
    version: 1,
    distanceM: asNumber(previewJson.distanceM),
    elevationGainM: asNumber(previewJson.elevationGainM),
    durationH: asNumber(previewJson.durationH),
    region: asString(previewJson.region),
    difficulty: asDifficulty(previewJson.difficulty),
    coordinates: asCoordinates(previewJson.coordinates),
  };

  if (!parsed.coordinates || parsed.coordinates.length < 2) {
    throw new BadRequestException(
      'previewJson.coordinates має містити мінімум 2 валідні точки',
    );
  }

  return parsed;
}
