import { RouteDetails } from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

export const routeInfoApi = {
  async getRouteInfo(routeId: string): Promise<RouteDetails> {
    const { data } = await apiClient.get<RouteDetails>(`/routes/${routeId}`)

    return data
  },
}
