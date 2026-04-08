import type { Difficulty } from '@/src/features/explore/types'

export type { Difficulty }

export type RouteType = 'loop' | 'out-and-back' | 'point-to-point'

export type PoiType = 'water' | 'shelter' | 'viewpoint' | 'peak'

export interface PoiMarker {
  id: string
  type: PoiType
  label: string
  latitude: number
  longitude: number
}

export interface ElevationPoint {
  distanceKm: number
  elevationM: number
}

export interface TransportInfo {
  byBus?: string
  byCar?: string
  nearestTown: string
}

export interface RouteDetails {
  id: string
  title: string
  region: string
  difficulty: Difficulty
  routeType: RouteType
  distanceKm: number
  elevationGainM: number
  durationH: number
  rating: number
  reviewCount: number
  imageUris: string[]
  description: string
  terrain: string
  bestSeason: string
  notes?: string
  elevationProfile: ElevationPoint[]
  poiMarkers: PoiMarker[]
  routeCoordinates: { latitude: number; longitude: number }[]
  transport: TransportInfo
  createdBy: string
  gpxAvailable: boolean
}
