import type {
  RoutePoi,
  RoutePoiSource,
  RoutePoiType,
} from 'src/prisma/generated/client';

export type RoutePoiWithSource = RoutePoi & { source: RoutePoiSource };

export type FeaturedRule = {
  limit: number;
  minSpacingM: number;
};

export type RouteLengthPreset = 'SHORT' | 'MEDIUM' | 'LONG';

export type FeaturedSupportedPoiTypes = Exclude<
  RoutePoiType,
  'PEAK' | 'VIEWPOINT'
>;
