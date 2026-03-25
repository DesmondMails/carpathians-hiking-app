import { Route } from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

export const homepageApi = {
  async getRoutes(): Promise<Route[]> {
    const { data } = await apiClient.get<Route[]>('/routes')

    return data
  },
}
