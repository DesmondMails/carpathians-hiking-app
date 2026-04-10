import { CreateRoutePayload, Route } from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

export const routeCreationApi = {
  async createRoute(payload: CreateRoutePayload): Promise<Route> {
    const { data } = await apiClient.post<Route>('/routes', payload)

    console.log('create route', data)

    return data
  },
}
