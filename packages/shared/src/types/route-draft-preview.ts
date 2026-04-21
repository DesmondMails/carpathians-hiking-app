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

export type RouteDraftPreviewCoordinate = {
  latitude: number
  longitude: number
  elevationM?: number
}

export type RouteDraftPreviewElevationPoint = {
  distanceKm: number
  elevationM: number
}

export type RouteDraftPreviewPoi = {
  id: string
  type: RouteDraftPreviewPoiType
  label: string
  latitude: number
  longitude: number
}

export type RouteDraftPreview = {
  version: 1
  region?: string
  difficulty?: RouteDraftPreviewDifficulty
  routeType?: RouteDraftPreviewRouteType
  distanceM?: number
  elevationGainM?: number
  durationH?: number
  coordinates?: RouteDraftPreviewCoordinate[]
  elevationProfile?: RouteDraftPreviewElevationPoint[]
  poiMarkers?: RouteDraftPreviewPoi[]
}
