import { RouteSaved } from '@hiking/shared'

import { apiClient } from './client'

export const saveRouteSharedApi = {
  async saveRoute(routeId: string): Promise<RouteSaved> {
    const { data } = await apiClient.put<RouteSaved>(`/routes/${routeId}/saved`)

    return data
  },

  async deleteRouteSaved(routeId: string): Promise<void> {
    await apiClient.delete<void>(`/routes/${routeId}/saved`)
  },
}
