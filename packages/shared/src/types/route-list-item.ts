import { RouteDifficulty } from '.'

export interface RouteListItem {
  id: string
  title: string
  description?: string | null
  region?: string | null
  difficulty: RouteDifficulty | null
  coverImageUrl?: string | null
  coverImageThumbhash?: string | null
  coverImageId?: string | null
  gpxAvailable: boolean
  distanceM: number | null
  elevationGainM: number | null
  durationH: number | null
  // Optional until the API selects them for list endpoints (ROUTE_LIST_SELECT)
  rating?: number
  reviewCount?: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  images: any[]
  createdAt: string
  updatedAt: string
  isSaved?: boolean
}
