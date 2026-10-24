import { Difficulty } from './route-difficulty'

export interface Route {
  id: string
  title: string
  description: string
  distanceKm: number
  elevationGainM: number
  createdByUserId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateRoutePayload {
  title: string
  description?: string
}

export interface SearchRoutePayload {
  difficulty?: Difficulty[]
  distanceFromM?: number
  distanceToM?: number
  latitude?: number
  longitude?: number
  radiusM?: number
}
