export type RouteDraftPreviewDifficulty =
  | 'EASY'
  | 'MODERATE'
  | 'HARD'
  | 'EXTREME'

export type RouteDraftPreviewRouteType =
  | 'LOOP'
  | 'OUT_AND_BACK'
  | 'POINT_TO_POINT'

export type RouteDraftPreviewPoiType =
  | 'WATER'
  | 'SHELTER'
  | 'VIEWPOINT'
  | 'PEAK'

export interface RouteDraftPreviewCoordinate {
  latitude: number
  longitude: number
  elevationM?: number
}

export interface RouteDraftPreviewElevationPoint {
  distanceKm: number
  elevationM: number
}

export interface RouteDraftPreviewPoi {
  id: string
  type: RouteDraftPreviewPoiType
  label: string
  latitude: number
  longitude: number
}

export interface RouteDraftPreview {
  version: 1
  region?: string
  difficulty?: RouteDraftPreviewDifficulty
  routeType?: RouteDraftPreviewRouteType
  distanceKm?: number
  elevationGainM?: number
  durationH?: number
  routeCoordinates?: RouteDraftPreviewCoordinate[]
  elevationProfile?: RouteDraftPreviewElevationPoint[]
  poiMarkers?: RouteDraftPreviewPoi[]
}
