import { RouteDetails } from '@hiking/shared'
import { create } from 'zustand'

import { routeInfoApi } from '../api/route-info.api'

interface RouteState {
  isLoading: boolean
  gpxUrl: string | null
  route: RouteDetails | null
  loadRoute: (routeId: string) => Promise<void>
  loadGpxUrl: (routeId: string) => Promise<string>
}

export const useRouteStore = create<RouteState>((set) => ({
  isLoading: false,
  gpxUrl: null,
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
  loadGpxUrl: async (routeId: string) => {
    set({ isLoading: true })

    try {
      const gpxUrl = await routeInfoApi.getGpxUrl(routeId)

      set({ gpxUrl })

      return gpxUrl
    } catch (error) {
      set({ isLoading: false })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
}))
