import {
  RouteDetails,
  RoutePoi,
  RoutePoiEnrichmentStatus,
} from '@hiking/shared'
import { create } from 'zustand'

import { routeInfoApi } from '../api/route-info.api'

interface RouteState {
  activeRouteId: string | null
  isLoading: boolean
  isPoisLoading: boolean
  gpxUrl: string | null
  featuredPoiMarkers: RoutePoi[]
  allPoiMarkers: RoutePoi[]
  poiStatus: RoutePoiEnrichmentStatus
  route: RouteDetails | null
  setActiveRouteId: (routeId: string | null) => void
  loadRoute: (routeId: string) => Promise<void>
  loadRoutePois: (routeId: string) => Promise<void>
  loadGpxUrl: (routeId: string) => Promise<string>
}

export const useRouteStore = create<RouteState>((set) => ({
  activeRouteId: null,
  isLoading: false,
  isPoisLoading: false,
  gpxUrl: null,
  featuredPoiMarkers: [],
  allPoiMarkers: [],
  poiStatus: 'PENDING',
  route: null,

  setActiveRouteId: (routeId) =>
    set((state) => {
      console.log('setActiveRouteId', routeId)
      if (state.activeRouteId === routeId) {
        return state
      }

      return {
        activeRouteId: routeId,
        route: null,
        featuredPoiMarkers: [],
        allPoiMarkers: [],
        poiStatus: 'PENDING',
      }
    }),

  loadRoute: async (routeId: string) => {
    set({ isLoading: true })

    try {
      const route = await routeInfoApi.getRouteInfo(routeId)

      set((state) => {
        if (state.activeRouteId !== routeId) {
          return { isLoading: false }
        }

        return {
          route,
          featuredPoiMarkers: route.featuredPoiMarkers,
          poiStatus: route.poiEnrichmentStatus,
        }
      })
    } catch (error) {
      set((state) => {
        if (state.activeRouteId !== routeId) {
          return { isLoading: false }
        }

        return {
          isLoading: false,
          route: null,
          featuredPoiMarkers: [],
          allPoiMarkers: [],
          poiStatus: 'FAILED',
        }
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

      set((state) => {
        if (state.activeRouteId !== routeId) {
          return { isPoisLoading: false }
        }

        console.log('response loadRoutePois', response)

        return {
          allPoiMarkers: response.poiMarkers,
          poiStatus: response.status,
        }
      })
    } catch (error) {
      set((state) => {
        if (state.activeRouteId !== routeId) {
          return { isPoisLoading: false }
        }

        return {
          poiStatus: 'FAILED',
        }
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
