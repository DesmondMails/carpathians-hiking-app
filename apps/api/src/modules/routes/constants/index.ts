import type { RoutePoi } from '@hiking/shared';

import type {
  FeaturedRule,
  FeaturedSupportedPoiTypes,
  RouteLengthPreset,
} from '../types/featured-pois';

export const SHORT_ROUTE_MAX_DISTANCE_M = 10_000;
export const MEDIUM_ROUTE_MAX_DISTANCE_M = 25_000;

export const FEATURED_RULES: Record<
  RouteLengthPreset,
  Record<FeaturedSupportedPoiTypes, FeaturedRule>
> = {
  SHORT: {
    WATER: {
      limit: 3,
      minSpacingM: 300,
    },
    SHELTER: {
      limit: 3,
      minSpacingM: 450,
    },
    CAMP: {
      limit: 2,
      minSpacingM: 500,
    },
  },
  MEDIUM: {
    WATER: {
      limit: 3,
      minSpacingM: 600,
    },
    SHELTER: {
      limit: 3,
      minSpacingM: 900,
    },
    CAMP: {
      limit: 2,
      minSpacingM: 900,
    },
  },
  LONG: {
    WATER: {
      limit: 3,
      minSpacingM: 900,
    },
    SHELTER: {
      limit: 3,
      minSpacingM: 1200,
    },
    CAMP: {
      limit: 2,
      minSpacingM: 1200,
    },
  },
};

export const CONFIDENCE_SCORE: Record<RoutePoi['confidence'], number> = {
  HIGH: 300,
  MEDIUM: 200,
  LOW: 100,
};

export const SHELTER_SUBTYPE_SCORE: Record<string, number> = {
  wilderness_hut: 90,
  alpine_hut: 85,
  amenity_shelter: 75,
  shelter_basic_hut: 72,
  shelter_weather_shelter: 68,
  shelter_lean_to: 64,
  building_hut: 28,
  building_cabin: 24,
};

export const WATER_SUBTYPE_SCORE: Record<string, number> = {
  drinking_water: 90,
  water_tap: 80,
  spring: 58,
  water_well: 45,
  drinking_fountain: 40,
};

export const CAMP_SUBTYPE_SCORE: Record<string, number> = {
  camp_site: 82,
  camp_pitch: 74,
  wild_camp_site: 68,
  basic_camp_site: 62,
};

export const GENERIC_LABELS = new Set([
  'Shelter',
  'Water',
  'Peak',
  'Camp site',
  'Camp pitch',
  'Wild camp',
  'Basic camp',
  'Viewpoint',
  'Wilderness hut',
  'Alpine hut',
  'Hut',
  'Cabin',
  'Drinking water',
  'Water tap',
  'Spring',
  'Fountain',
]);
