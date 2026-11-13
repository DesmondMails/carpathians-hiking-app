export interface RouteSaved {
  routeId: string
  userId: string
  savedAt: string
}

export interface SavedRoutesPayload {
  limit?: number
  offset?: number
}
