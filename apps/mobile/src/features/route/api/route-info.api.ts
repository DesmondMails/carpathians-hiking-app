import { RouteDetails, RoutePoisResponse } from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

export const routeInfoApi = {
  async getRouteInfo(routeId: string): Promise<RouteDetails> {
    const { data } = await apiClient.get<RouteDetails>(`/routes/${routeId}`)

    return data
  },

  async getRoutePois(routeId: string): Promise<RoutePoisResponse> {
    const { data } = await apiClient.get<RoutePoisResponse>(
      `/routes/${routeId}/pois`,
    )

    return data
  },

  async getFeaturedRoutePois(
    routeId: string,
    signal?: AbortSignal,
  ): Promise<RoutePoisResponse> {
    const { data } = await apiClient.get<RoutePoisResponse>(
      `/routes/${routeId}/pois/featured`,
      { signal },
    )

    return data
  },

  async getGpxUrl(routeId: string): Promise<string> {
    const { data } = await apiClient.get<string>(`/routes/${routeId}/gpx-url`)

    return data
  },

  async reEnrichRoutePois(routeId: string): Promise<void> {
    await apiClient.post(`/routes/${routeId}/poi-enrichment`)
  },
}
