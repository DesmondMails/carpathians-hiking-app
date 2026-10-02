import {
  RouteDetails,
  RoutePoi,
  RoutePoiEnrichmentStatus,
  RoutePoiEnrichmentStatusOptions,
} from '@hiking/shared'
import { create } from 'zustand'

import { routeInfoApi } from '../api/route-info.api'

interface RouteState {
  activeRouteId: string | null
  isLoading: boolean
  isPoisLoading: boolean
  isFeaturedPoisLoading: boolean
  gpxUrl: string | null
  featuredPoiMarkers: RoutePoi[]
  allPoiMarkers: RoutePoi[]
  poiStatus: RoutePoiEnrichmentStatus
  route: RouteDetails | null
  setActiveRouteId: (routeId: string | null) => void
  loadRoute: (routeId: string) => Promise<void>
  loadRoutePois: (routeId: string) => Promise<void>
  loadFeaturedRoutePois: (routeId: string) => Promise<void>
  loadGpxUrl: (routeId: string) => Promise<string>
}

export const useRouteStore = create<RouteState>((set) => ({
  activeRouteId: null,
  isLoading: false,
  isPoisLoading: false,
  isFeaturedPoisLoading: false,
  gpxUrl: null,
  featuredPoiMarkers: [],
  allPoiMarkers: [],
  poiStatus: 'PENDING',
  route: null,

  setActiveRouteId: (routeId) =>
    set((state) => {
      if (state.activeRouteId === routeId) {
        return state
      }

      return {
        activeRouteId: routeId,
        route: null,
        featuredPoiMarkers: [],
        allPoiMarkers: [],
        poiStatus: RoutePoiEnrichmentStatusOptions.PENDING,
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
          allPoiMarkers: [],
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
          poiStatus: response.status,
          allPoiMarkers: response.poiMarkers,
        }
      })
    } catch (error) {
      set((state) => {
        if (state.activeRouteId !== routeId) {
          return { isPoisLoading: false }
        }

        return {
          poiStatus: RoutePoiEnrichmentStatusOptions.FAILED,
        }
      })
      throw error
    } finally {
      set({ isPoisLoading: false })
    }
  },
  loadFeaturedRoutePois: async (routeId: string) => {
    set({ isFeaturedPoisLoading: true })

    try {
      const response = await routeInfoApi.getFeaturedRoutePois(routeId)

      set((state) => {
        if (state.activeRouteId !== routeId) {
          return { isFeaturedPoisLoading: false }
        }

        return {
          poiStatus: response.status,
          featuredPoiMarkers: response.poiMarkers,
        }
      })
    } catch (error) {
      set((state) => {
        if (state.activeRouteId !== routeId) {
          return { isFeaturedPoisLoading: false }
        }

        return {
          poiStatus: RoutePoiEnrichmentStatusOptions.FAILED,
          featuredPoiMarkers: [],
        }
      })
      throw error
    } finally {
      set({ isFeaturedPoisLoading: false })
    }
  },
  loadGpxUrl: async (routeId: string) => {
    try {
      const gpxUrl = await routeInfoApi.getGpxUrl(routeId)

      set({ gpxUrl })

      return gpxUrl
    } catch (error) {
      throw error
    }
  },
}))
