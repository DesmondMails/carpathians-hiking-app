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
