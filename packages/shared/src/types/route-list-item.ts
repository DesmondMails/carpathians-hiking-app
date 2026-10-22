import { RouteDifficulty } from '.'

export interface RouteListItem {
  id: string
  title: string
  description?: string | null
  region?: string | null
  difficulty: RouteDifficulty | null
  coverImageUrl?: string | null
  gpxAvailable: boolean
  distanceM: number | null
  elevationGainM: number | null
  durationH: number | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  images: any[]
  createdAt: string
  updatedAt: string
}
