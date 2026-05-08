import type { RouteAuthor, RouteDetails } from '@hiking/shared';

import {
  asCoordinates,
  asElevationProfile,
  asPoiMarkers,
} from 'src/common/utils/json-guards';
import type { Route } from 'src/prisma/generated/client';

export interface RouteAuthorSource {
  id: string;
  email: string;
  avatar: string | null;
}

export interface RouteImageViewSource {
  coverImageUrl: string | null;
  imageUrls: string[];
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
    poiMarkers: asPoiMarkers(route.poiMarkersJson) ?? [],

    gpxAvailable: route.gpxAvailable,
    rating: route.rating,
    reviewCount: route.reviewCount,

    createdBy,

    status: route.status,
    createdAt: route.createdAt.toISOString(),
    updatedAt: route.updatedAt.toISOString(),
  };
};
