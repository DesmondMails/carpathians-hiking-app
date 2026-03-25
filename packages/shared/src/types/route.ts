import { PublicUser } from './user'

export interface Route {
  id: string
  title: string
  description: string
  distanceKm: number
  elevationGainM: number
  createdByUserId: string
  createdByUser: PublicUser
  createdAt: Date
  updatedAt: Date
}
