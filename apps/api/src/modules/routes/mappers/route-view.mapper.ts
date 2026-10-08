import type {
  RouteAuthor,
  RouteDetails,
  RoutePoisResponse,
} from '@hiking/shared';
import type { RoutePoi as SharedRoutePoi } from '@hiking/shared/types/route-poi';

import {
  asCoordinates,
  asElevationProfile,
} from 'src/common/utils/json-guards';
import type {
  Route,
  RoutePoi,
  RoutePoiSource,
} from 'src/prisma/generated/client';

export interface RouteAuthorSource {
  id: string;
  email: string;
  avatar: string | null;
}

export interface RouteImageViewSource {
  coverImageUrl: string | null;
  imageUrls: string[];
}

export type RouteWithPois = Route & {
  routePois: (RoutePoi & { source: RoutePoiSource })[];
};

export function toRoutePoiView(
  poi: RoutePoi & { source: RoutePoiSource },
): SharedRoutePoi {
  return {
    id: poi.id,
    type: poi.type,
    subtype: poi.subtype,
    label: poi.label,
    latitude: poi.latitude,
    longitude: poi.longitude,
    distanceFromRouteM: poi.distanceFromRouteM,
    distanceFromStartM: poi.distanceFromStartM,
    confidence: poi.confidence,
    waterPotability: poi.waterPotability,
    access: poi.access,
    sortOrder: poi.sortOrder,
    metadata: poi.metadataJson as Record<string, any>,
    updatedAt: poi.updatedAt.toISOString(),
    createdAt: poi.createdAt.toISOString(),
    source: {
      id: poi.source.id,
      provider: poi.source.provider,
      osmType: poi.source.osmType,
      osmId: poi.source.osmId,
      rawTags: poi.source.rawTagsJson as Record<string, string>,
      rawGeometryCenter: poi.source.rawGeometryCenterJson as Record<
        string,
        number
      >,
      fetchedAt: poi.source.fetchedAt.toISOString(),
      hash: poi.source.hash,
    },
  };
}

export function toRoutePoisResponse(route: RouteWithPois): RoutePoisResponse {
  return {
    status: route.poiEnrichmentStatus,
    poiEnrichedFailedAt: route.poiEnrichedFailedAt?.toISOString() ?? null,
    poiMarkers: route.routePois.map(toRoutePoiView),
  };
}

export const toRouteView = (
  route: Route,
  author: RouteAuthorSource,
  images: RouteImageViewSource,
): RouteDetails => {
  const createdBy: RouteAuthor = {
    id: author.id,
    // TODO: replace with a real display-name column once the User model has one.
    name: author.email,
    avatarUrl: author.avatar,
  };

  return {
    id: route.id,
    title: route.title,
    description: route.description,
    region: route.region,
    difficulty: route.difficulty,
    routeType: route.routeType,

    distanceM: route.distanceM,
    elevationGainM: route.elevationGainM,
    durationH: route.durationH,

    coverImageUrl: images.coverImageUrl,
    imageUrls: images.imageUrls,

    routeCoordinates: asCoordinates(route.routeCoordinatesJson) ?? [],
    elevationProfile: asElevationProfile(route.elevationProfileJson) ?? [],
    poiEnrichmentStatus: route.poiEnrichmentStatus,
    poiEnrichedFailedAt: route.poiEnrichedFailedAt?.toISOString() ?? null,
    poiEnrichedFailedError: route.poiEnrichmentError ?? null,

    gpxAvailable: route.gpxAvailable,
    rating: route.rating,
    reviewCount: route.reviewCount,

    createdBy,

    status: route.status,
    createdAt: route.createdAt.toISOString(),
    updatedAt: route.updatedAt.toISOString(),
  };
};
