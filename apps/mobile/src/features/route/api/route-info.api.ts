import { RouteDetails } from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

export const routeInfoApi = {
  async getRouteInfo(routeId: string): Promise<RouteDetails> {
    const { data } = await apiClient.get<RouteDetails>(`/routes/${routeId}`)

    return data
  },

  async getGpxUrl(routeId: string): Promise<string> {
    const { data } = await apiClient.get<string>(`/routes/${routeId}/gpx-url`)

    return data
  },
}
