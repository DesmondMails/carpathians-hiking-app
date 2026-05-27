import { RouteDetails, RoutePoi, RoutePoiEnrichmentStatus } from '@hiking/shared'
import { create } from 'zustand'

import { routeInfoApi } from '../api/route-info.api'

interface RouteState {
  isLoading: boolean
  isPoisLoading: boolean
  gpxUrl: string | null
  poiMarkers: RoutePoi[]
  poiStatus: RoutePoiEnrichmentStatus
  route: RouteDetails | null
  loadRoute: (routeId: string) => Promise<void>
  loadRoutePois: (routeId: string) => Promise<void>
  loadGpxUrl: (routeId: string) => Promise<string>
}

export const useRouteStore = create<RouteState>((set) => ({
  isLoading: false,
  isPoisLoading: false,
  gpxUrl: null,
  poiMarkers: [],
  poiStatus: 'PENDING',
  route: null,

  loadRoute: async (routeId: string) => {
    set({ isLoading: true })

    try {
      const route = await routeInfoApi.getRouteInfo(routeId)

      set({
        route,
        poiMarkers: route.poiMarkers,
        poiStatus: route.poiEnrichmentStatus,
      })
    } catch (error) {
      set({
        isLoading: false,
        route: null,
        poiMarkers: [],
        poiStatus: 'FAILED',
      })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  loadRoutePois: async (routeId: string) => {
    set({ isPoisLoading: true })

    try {
      const response = await routeInfoApi.getRoutePois(routeId)

      set({
        poiMarkers: response.poiMarkers,
        poiStatus: response.status,
      })
    } catch (error) {
      set({
        poiStatus: 'FAILED',
      })
      throw error
    } finally {
      set({ isPoisLoading: false })
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
