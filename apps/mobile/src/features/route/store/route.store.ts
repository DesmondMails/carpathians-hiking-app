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
  reEnrichmentError: string | null
  gpxUrl: string | null
  featuredPoiMarkers: RoutePoi[]
  allPoiMarkers: RoutePoi[]
  poiStatus: RoutePoiEnrichmentStatus
  route: RouteDetails | null
  isReEnriching: boolean
  poiEnrichedFailedAt: string | null
  featuredPoisPollVersion: number
  setActiveRouteId: (routeId: string | null) => void
  loadRoute: (routeId: string) => Promise<void>
  loadRoutePois: (routeId: string) => Promise<void>
  loadFeaturedRoutePois: (
    routeId: string,
    signal?: AbortSignal,
  ) => Promise<FeaturedPoisLoadResult>
  loadGpxUrl: (routeId: string) => Promise<string>
  reEnrichRoutePois: (routeId: string) => Promise<void>
}

export const useRouteStore = create<RouteState>((set, get) => {
  let featuredRequestId = 0
  let retryRequestId = 0
  // An accepted job may still expose the previous FAILED until the worker starts.
  let awaitingFailureAt: string | null | undefined

  return {
    activeRouteId: null,
    isLoading: false,
    isPoisLoading: false,
    isFeaturedPoisLoading: false,
    featuredPoisError: null,
    reEnrichmentError: null,
    gpxUrl: null,
    featuredPoiMarkers: [],
    allPoiMarkers: [],
    poiStatus: 'PENDING',
    route: null,
    isReEnriching: false,
    poiEnrichedFailedAt: null,
    featuredPoisPollVersion: 0,
    setActiveRouteId: (routeId) =>
      set((state) => {
        if (state.activeRouteId === routeId) {
          return state
        }

        featuredRequestId += 1
        retryRequestId += 1
        awaitingFailureAt = undefined

        return {
          isFeaturedPoisLoading: false,
          isReEnriching: false,
          poiEnrichedFailedAt: null,
          featuredPoisError: null,
          reEnrichmentError: null,
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

          return {
            allPoiMarkers: response.poiMarkers,
          }
        })
      } catch (error) {
        throw error
      } finally {
        set({ isPoisLoading: false })
      }
    },
    loadFeaturedRoutePois: async (routeId, signal) => {
      if (
        get().activeRouteId !== routeId ||
        signal?.aborted ||
        get().isReEnriching
      ) {
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

        const failedAt = response.poiEnrichedFailedAt ?? null
        const isPreviousFailure =
          awaitingFailureAt !== undefined &&
          response.status === RoutePoiEnrichmentStatusOptions.FAILED &&
          failedAt === awaitingFailureAt
        const status = isPreviousFailure
          ? RoutePoiEnrichmentStatusOptions.PENDING
          : response.status
        if (!isPreviousFailure) awaitingFailureAt = undefined

        set({
          poiStatus: status,
          poiEnrichedFailedAt: failedAt,
          featuredPoiMarkers: response.poiMarkers,
          featuredPoisError: null,
        })
        return { kind: 'success', status }
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

    reEnrichRoutePois: async (routeId: string) => {
      if (get().activeRouteId !== routeId || get().isReEnriching) return

      const requestId = ++retryRequestId
      const isCurrentRequest = () =>
        requestId === retryRequestId && get().activeRouteId === routeId
      const failedAt = get().poiEnrichedFailedAt
      featuredRequestId += 1
      set({
        isReEnriching: true,
        isFeaturedPoisLoading: false,
        reEnrichmentError: null,
      })
      try {
        await routeInfoApi.reEnrichRoutePois(routeId)
        if (!isCurrentRequest()) return

        awaitingFailureAt = failedAt
        set((state) => ({
          poiStatus: RoutePoiEnrichmentStatusOptions.PENDING,
          featuredPoisError: null,
          featuredPoisPollVersion: state.featuredPoisPollVersion + 1,
        }))
      } catch (error) {
        if (!isCurrentRequest()) return
        const serverMessage = isAxiosError(error)
          ? error.response?.data?.message
          : null
        set({
          reEnrichmentError:
            typeof serverMessage === 'string'
              ? serverMessage
              : 'Не вдалося повторно запустити пошук POI. Спробуйте відкрити маршрут ще раз.',
        })
      } finally {
        if (isCurrentRequest()) set({ isReEnriching: false })
      }
    },
  }
})
