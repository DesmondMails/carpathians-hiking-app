import { RouteListItem, SavedRoutesPayload } from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

export const savedApi = {
  async loadSavedRoutes(
    savedQuery: SavedRoutesPayload = {}
  ): Promise<RouteListItem[]> {
    const { data } = await apiClient.get<RouteListItem[]>('/routes/saved', {
      params: savedQuery,
    })

    return data
  },
}
