import type {
  RoutePoiAccess,
  RoutePoiConfidence,
  RoutePoiOsmType,
  RoutePoiProvider,
  RoutePoiType,
  RoutePoiWaterPotability,
} from '@hiking/shared/types/route-poi';

export type OverpassBBox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type OverpassElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat?: number;
    lon?: number;
  };
  tags?: Record<string, string>;
};

export type OverpassResponse = {
  elements?: OverpassElement[];
};

export type NormalizedPoiMetadata = Record<
  string,
  string | number | boolean | null
>;

export type NormalizedPoiCandidate = {
  provider: RoutePoiProvider;
  osmType: RoutePoiOsmType;
  osmId: string;
  type: RoutePoiType;
  subtype?: string;
  label: string;
  latitude: number;
  longitude: number;
  confidence: RoutePoiConfidence;
  waterPotability: RoutePoiWaterPotability;
  access: RoutePoiAccess;
  rawTags: Record<string, string>;
  rawGeometryCenter: {
    latitude: number;
    longitude: number;
  };
  metadata: NormalizedPoiMetadata;
};

export type PersistablePoiCandidate = NormalizedPoiCandidate & {
  distanceFromRouteM: number;
  distanceFromStartM: number;
  score: number;
};
