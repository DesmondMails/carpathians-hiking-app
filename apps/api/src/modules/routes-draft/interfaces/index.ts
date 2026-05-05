import { RouteElevationPoint } from '@hiking/shared';

export type Coordinate = {
  longitude: number;
  latitude: number;
  elevationM: number;
};

export interface GpxPoint {
  lat?: number | string;
  lon?: number | string;
  ele?: number | string;
}

export interface GpxTrackSegment {
  trkpt?: GpxPoint[];
}

export interface GpxTrack {
  name?: string;
  trkseg?: GpxTrackSegment[];
}

export interface GpxRoute {
  name?: string;
  rtept?: GpxPoint[];
}

export interface GpxDocument {
  trk?: GpxTrack[];
  rte?: GpxRoute[];
}

export interface GpxElevationStats {
  elevationGainM: number;
  elevationLossM: number;
  maxElevationM: number;
  minElevationM: number;
}

export type ParsedGpx = {
  coordinates: Coordinate[];
  distanceM: number;
  region: string | null;
  // elevation: GpxElevationStats;
  elevationGainM: number;
  elevationProfile: RouteElevationPoint[];
};
