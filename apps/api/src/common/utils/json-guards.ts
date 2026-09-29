import type {
  RouteCoordinate,
  RouteElevationPoint,
} from '@hiking/shared/types/route-details';
import {
  RoutePoi,
  RoutePoiAccess,
  RoutePoiConfidence,
  RoutePoiSource,
  RoutePoiType,
  RoutePoiWaterPotability,
} from '@hiking/shared/types/route-poi';

import type { Prisma } from 'src/prisma/generated/client';

export function isJsonObject(
  value: Prisma.JsonValue | null | undefined,
): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asNumber(
  value: Prisma.JsonValue | undefined,
): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

export function asString(
  value: Prisma.JsonValue | undefined,
): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function asStringArray(
  value: Prisma.JsonValue | null | undefined,
): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const result: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') result.push(item);
  }

  return result.length ? result : undefined;
}

export function asCoordinates(
  value: Prisma.JsonValue | null | undefined,
): RouteCoordinate[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const result: RouteCoordinate[] = [];

  for (const item of value) {
    if (!isJsonObject(item)) continue;

    const latitude = asNumber(item.latitude);
    const longitude = asNumber(item.longitude);
    const elevationRaw = item.elevationM;
    const elevationM =
      elevationRaw === null ? undefined : asNumber(elevationRaw);

    if (latitude === undefined || longitude === undefined) continue;

    result.push({
      latitude,
      longitude,
      ...(elevationM !== undefined ? { elevationM } : {}),
    });
  }

  return result.length ? result : undefined;
}

export function asElevationProfile(
  value: Prisma.JsonValue | null | undefined,
): RouteElevationPoint[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const result: RouteElevationPoint[] = [];

  for (const item of value) {
    if (!isJsonObject(item)) continue;

    const distanceM = asNumber(item.distanceM);
    const elevationM = asNumber(item.elevationM);

    if (distanceM === undefined || elevationM === undefined) continue;

    result.push({ distanceM, elevationM });
  }

  return result.length ? result : undefined;
}

const POI_TYPES = [
  'WATER',
  'SHELTER',
  'CAMP',
  'VIEWPOINT',
  'PEAK',
] as const satisfies readonly RoutePoiType[];

const POI_CONFIDENCES = [
  'HIGH',
  'MEDIUM',
  'LOW',
] as const satisfies readonly RoutePoiConfidence[];
const POI_WATER_POTABILITIES = [
  'CONFIRMED',
  'UNKNOWN',
  'NON_POTABLE',
] as const satisfies readonly RoutePoiWaterPotability[];
const POI_ACCESSES = [
  'PUBLIC',
  'PRIVATE',
] as const satisfies readonly RoutePoiAccess[];

function asPoiType(
  value: Prisma.JsonValue | undefined,
): RoutePoiType | undefined {
  return typeof value === 'string' &&
    (POI_TYPES as readonly string[]).includes(value)
    ? (value as RoutePoiType)
    : undefined;
}

function asPoiConfidence(
  value: Prisma.JsonValue | undefined,
): RoutePoiConfidence | undefined {
  return typeof value === 'string' &&
    (POI_CONFIDENCES as readonly string[]).includes(value)
    ? (value as RoutePoiConfidence)
    : undefined;
}

function asPoiWaterPotability(
  value: Prisma.JsonValue | undefined,
): RoutePoiWaterPotability | undefined {
  return typeof value === 'string' &&
    (POI_WATER_POTABILITIES as readonly string[]).includes(value)
    ? (value as RoutePoiWaterPotability)
    : undefined;
}

function asPoiAccess(
  value: Prisma.JsonValue | undefined,
): RoutePoiAccess | undefined {
  return typeof value === 'string' &&
    (POI_ACCESSES as readonly string[]).includes(value)
    ? (value as RoutePoiAccess)
    : undefined;
}

function asPoiSource(
  value: Prisma.JsonValue | undefined,
): RoutePoiSource | undefined {
  if (!isJsonObject(value)) return undefined;

  const id = asString(value.id);
  const provider = asString(value.provider);
  const osmType = asString(value.osmType);
  const osmId = asString(value.osmId);
  const fetchedAt = asString(value.fetchedAt);
  const hash = asString(value.hash);
  const rawTags = isJsonObject(value.rawTags)
    ? (value.rawTags as Record<string, string>)
    : undefined;
  const rawGeometryCenter = isJsonObject(value.rawGeometryCenter)
    ? (value.rawGeometryCenter as Record<string, number>)
    : undefined;

  if (
    id === undefined ||
    provider === undefined ||
    osmType === undefined ||
    osmId === undefined ||
    fetchedAt === undefined ||
    hash === undefined ||
    rawTags === undefined ||
    rawGeometryCenter === undefined
  ) {
    return undefined;
  }

  return {
    id,
    provider: provider as RoutePoiSource['provider'],
    osmType: osmType as RoutePoiSource['osmType'],
    osmId,
    rawTags,
    rawGeometryCenter,
    fetchedAt,
    hash,
  };
}

export function asPoiMarkers(
  value: RoutePoi[] | null | undefined,
): RoutePoi[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const result: RoutePoi[] = [];

  for (const item of value) {
    const id = asString(item.id);
    const type = asPoiType(item.type);
    const label = asString(item.label);
    const latitude = asNumber(item.latitude);
    const longitude = asNumber(item.longitude);
    const distanceFromRouteM = asNumber(item.distanceFromRouteM);
    const distanceFromStartM = asNumber(item.distanceFromStartM);
    const confidence = asPoiConfidence(item.confidence);
    const waterPotability = asPoiWaterPotability(item.waterPotability);
    const access = asPoiAccess(item.access);
    const sortOrder = asNumber(item.sortOrder);
    const createdAt = asString(item.createdAt);
    const updatedAt = asString(item.updatedAt);
    const source = asPoiSource(item.source as unknown as Prisma.JsonValue);
    const metadata = item.metadata;

    if (
      id === undefined ||
      type === undefined ||
      label === undefined ||
      latitude === undefined ||
      longitude === undefined ||
      distanceFromRouteM === undefined ||
      distanceFromStartM === undefined ||
      confidence === undefined ||
      waterPotability === undefined ||
      access === undefined ||
      sortOrder === undefined ||
      createdAt === undefined ||
      updatedAt === undefined ||
      source === undefined ||
      metadata === undefined
    ) {
      continue;
    }

    result.push({
      id,
      type,
      label,
      latitude,
      longitude,
      distanceFromRouteM,
      distanceFromStartM,
      confidence,
      waterPotability,
      access,
      sortOrder,
      metadata,
      createdAt,
      updatedAt,
      source,
    });
  }

  return result.length ? result : undefined;
}
