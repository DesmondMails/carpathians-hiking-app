import type {
  RouteCoordinate,
  RouteElevationPoint,
  RoutePoi,
  RoutePoiType,
} from '@hiking/shared/types/route-details';

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
  'VIEWPOINT',
  'PEAK',
] as const satisfies readonly RoutePoiType[];

function asPoiType(
  value: Prisma.JsonValue | undefined,
): RoutePoiType | undefined {
  return typeof value === 'string' &&
    (POI_TYPES as readonly string[]).includes(value)
    ? (value as RoutePoiType)
    : undefined;
}

export function asPoiMarkers(
  value: Prisma.JsonValue | null | undefined,
): RoutePoi[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const result: RoutePoi[] = [];

  for (const item of value) {
    if (!isJsonObject(item)) continue;

    const id = asString(item.id);
    const type = asPoiType(item.type);
    const label = asString(item.label);
    const latitude = asNumber(item.latitude);
    const longitude = asNumber(item.longitude);

    if (
      id === undefined ||
      type === undefined ||
      label === undefined ||
      latitude === undefined ||
      longitude === undefined
    ) {
      continue;
    }

    result.push({ id, type, label, latitude, longitude });
  }

  return result.length ? result : undefined;
}
