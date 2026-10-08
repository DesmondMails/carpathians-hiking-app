export type RoutePoiConfidence = 'HIGH' | 'MEDIUM' | 'LOW'
export type RoutePoiWaterPotability = 'CONFIRMED' | 'UNKNOWN' | 'NON_POTABLE'
export type RoutePoiAccess = 'PUBLIC' | 'PRIVATE'
export type RoutePoiProvider = 'OVERPASS'
export type RoutePoiOsmType = 'NODE' | 'WAY' | 'RELATION'
export type RoutePoiType = 'WATER' | 'SHELTER' | 'CAMP' | 'VIEWPOINT' | 'PEAK'

export const RoutePoiEnrichmentStatusOptions = {
  PENDING: 'PENDING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const

export type RoutePoiEnrichmentStatus =
  (typeof RoutePoiEnrichmentStatusOptions)[keyof typeof RoutePoiEnrichmentStatusOptions]

export interface RoutePoi {
  id: string
  type: RoutePoiType
  subtype?: string | null
  label: string
  latitude: number
  longitude: number
  distanceFromRouteM: number
  distanceFromStartM: number
  confidence: RoutePoiConfidence
  waterPotability: RoutePoiWaterPotability
  access: RoutePoiAccess
  sortOrder: number
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
  source?: RoutePoiSource
}

export interface RoutePoiSource {
  id: string
  provider: RoutePoiProvider
  osmType: RoutePoiOsmType
  osmId: string
  rawTags: Record<string, string>
  rawGeometryCenter: Record<string, number>
  fetchedAt: string
  hash: string
}

export interface RoutePoisResponse {
  poiEnrichedFailedAt: string | null
  status: RoutePoiEnrichmentStatus
  poiMarkers: RoutePoi[]
}
