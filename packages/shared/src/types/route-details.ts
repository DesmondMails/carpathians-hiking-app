export type RouteDifficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXTREME'
export type RouteType = 'LOOP' | 'OUT_AND_BACK' | 'POINT_TO_POINT'
export type RoutePoiType = 'WATER' | 'SHELTER' | 'VIEWPOINT' | 'PEAK'

export interface RouteCoordinate {
  latitude: number
  longitude: number
  elevationM?: number
}

export interface RouteElevationPoint {
  distanceM: number
  elevationM: number
}

export interface RoutePoi {
  id: string
  type: RoutePoiType
  label: string
  latitude: number
  longitude: number
}

export interface RouteAuthor {
  id: string
  name: string
  avatarUrl?: string | null
}

export interface RouteDetails {
  id: string
  title: string
  description?: string | null
  region?: string | null
  difficulty: RouteDifficulty | null
  routeType: RouteType | null
  distanceM: number | null
  elevationGainM: number | null
  durationH: number | null

  coverImageUrl?: string | null
  imageUrls?: string[]

  routeCoordinates: RouteCoordinate[]
  elevationProfile: RouteElevationPoint[]
  poiMarkers: RoutePoi[]

  gpxAvailable: boolean
  rating: number
  reviewCount: number

  createdBy: RouteAuthor

  notes?: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export const DIFFICULTY_LABELS: Record<RouteDifficulty, string> = {
  EASY: 'Легкий',
  MODERATE: 'Помірний',
  HARD: 'Складний',
  EXTREME: 'Екстремальний',
}
