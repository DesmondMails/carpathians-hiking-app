import {
  RouteDetails,
  RoutePoi,
  RoutePoiEnrichmentStatus,
  RoutePoiEnrichmentStatusOptions,
} from '@hiking/shared'
import { isAxiosError } from 'axios'
import { create } from 'zustand'

import { routeInfoApi } from '../api/route-info.api'

export type FeaturedPoisLoadResult =
  | { kind: 'success'; status: RoutePoiEnrichmentStatus }
  | { kind: 'error'; retryable: boolean }
  | { kind: 'cancelled' }

interface RouteState {
  activeRouteId: string | null
  isLoading: boolean
  isPoisLoading: boolean
  isFeaturedPoisLoading: boolean
  featuredPoisError: string | null
  gpxUrl: string | null
  featuredPoiMarkers: RoutePoi[]
  allPoiMarkers: RoutePoi[]
  poiStatus: RoutePoiEnrichmentStatus
  route: RouteDetails | null
  setActiveRouteId: (routeId: string | null) => void
  loadRoute: (routeId: string) => Promise<void>
  loadRoutePois: (routeId: string) => Promise<void>
  loadFeaturedRoutePois: (
    routeId: string,
    signal?: AbortSignal,
  ) => Promise<FeaturedPoisLoadResult>
  loadGpxUrl: (routeId: string) => Promise<string>
}

export const useRouteStore = create<RouteState>((set, get) => {
  let featuredRequestId = 0

  return {
    activeRouteId: null,
    isLoading: false,
    isPoisLoading: false,
    isFeaturedPoisLoading: false,
    featuredPoisError: null,
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

        featuredRequestId += 1

        return {
          isFeaturedPoisLoading: false,
          featuredPoisError: null,
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
    loadFeaturedRoutePois: async (routeId, signal) => {
      if (get().activeRouteId !== routeId || signal?.aborted) {
        return { kind: 'cancelled' }
      }

      const requestId = ++featuredRequestId
      const isCurrentRequest = () =>
        requestId === featuredRequestId && get().activeRouteId === routeId

      set({ isFeaturedPoisLoading: true })

      try {
        const response = await routeInfoApi.getFeaturedRoutePois(
          routeId,
          signal,
        )

        if (!isCurrentRequest() || signal?.aborted) {
          return { kind: 'cancelled' }
        }

        set({
          poiStatus: response.status,
          featuredPoiMarkers: response.poiMarkers,
          featuredPoisError: null,
        })
        return { kind: 'success', status: response.status }
      } catch (error) {
        if (!isCurrentRequest() || signal?.aborted) {
          return { kind: 'cancelled' }
        }

        const status = isAxiosError(error) ? error.response?.status : undefined
        const retryable =
          isAxiosError(error) &&
          (status === undefined ||
            status === 408 ||
            status === 429 ||
            status >= 500)

        set({
          featuredPoisError:
            status === 404
              ? 'Маршрут не знайдено'
              : 'Не вдалося оновити POI. Спробуйте відкрити маршрут ще раз.',
        })
        return { kind: 'error', retryable }
      } finally {
        if (isCurrentRequest()) {
          set({ isFeaturedPoisLoading: false })
        }
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
  }
})
