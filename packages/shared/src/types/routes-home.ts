import { RouteListItem } from './route-list-item'

export type HomeResponse = {
  carousel: HomeKindWithList
  recommendations: HomeKindWithList
}

export interface GetHomePayload {
  latitude?: number
  longitude?: number
}

export interface HomeKindWithList {
  kind: CarouselKind | RecommendationsKind
  routes: RouteListItem[]
}

export type CarouselKind = 'nearby' | 'recent'
export type RecommendationsKind = 'ideas' | 'for_you'
