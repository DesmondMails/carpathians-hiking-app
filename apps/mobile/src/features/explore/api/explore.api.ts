import { RouteListItem, SearchRoutePayload } from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

export const exploreApi = {
  async loadRoutes(payload: SearchRoutePayload = {}): Promise<RouteListItem[]> {
    const { data } = await apiClient.get<RouteListItem[]>('/routes', {
      params: {
        difficulty: payload.difficulty?.length
          ? payload.difficulty.join(',')
          : undefined,
      },
    })

    return data
  },
}
