import { RouteDifficulty } from './route-details'

export interface EditableRouteImage {
  id: string
  url: string
  sortOrder: number
  isCover: boolean
}

export interface EditableRoute {
  id: string
  title: string
  description?: string | null
  region?: string | null
  difficulty: RouteDifficulty | null
  coverImageId?: string | null
  gpxAvailable: boolean
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  images: EditableRouteImage[]
  createdAt: string
  updatedAt: string
}

export interface UpdateRoutePayload {
  title?: string
  description?: string
  region?: string
  difficulty?: RouteDifficulty
}

export interface SetRouteCoverPayload {
  imageId: string
}

export interface CompleteRouteImageUploadPayload {
  imageId: string
  storageKey: string
  sortOrder?: number
}
