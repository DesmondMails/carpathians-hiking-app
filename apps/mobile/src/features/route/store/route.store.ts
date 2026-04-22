import { RouteDetails } from '@hiking/shared'
import { create } from 'zustand'

import { routeInfoApi } from '../api/route-info.api'

interface RouteState {
  isLoading: boolean
  route: RouteDetails | null
  loadRoute: (routeId: string) => Promise<void>
}

export const useRouteStore = create<RouteState>((set) => ({
  isLoading: false,
  route: null,
  loadRoute: async (routeId: string) => {
    set({ isLoading: true })

    try {
      const route = await routeInfoApi.getRouteInfo(routeId)

      set({ route })
    } catch (error) {
      set({ isLoading: false, route: null })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
}))
