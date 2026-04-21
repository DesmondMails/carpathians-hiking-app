import {
  CreateRoutePayload,
  FinalizeRouteDraftPayload,
  Route,
  RouteDraft,
} from '@hiking/shared'
import { create } from 'zustand'

import { GpxFileAsset, routeCreationApi } from '../api/route-creation.api'

interface RouteCreationState {
  isLoading: boolean
  isFinalizing: boolean
  routeDraft: RouteDraft | null

  uploadGpx: (file: GpxFileAsset) => Promise<RouteDraft>
  createRoute: (payload: CreateRoutePayload) => Promise<Route>
  finalizeRoute: (
    routeDraftId: string,
    payload: FinalizeRouteDraftPayload,
  ) => Promise<Route>
  resetRouteDraft: () => void
}

export const useRouteCreationStore = create<RouteCreationState>((set) => ({
  isLoading: false,
  isFinalizing: false,
  routeDraft: null,
  uploadGpx: async (file) => {
    set({ isLoading: true })

    try {
      const routeDraft = await routeCreationApi.uploadGpx(file)

      set({ routeDraft })

      return routeDraft
    } catch (error) {
      set({ isLoading: false })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  createRoute: async (payload) => {
    set({ isLoading: true })

    try {
      const route = await routeCreationApi.createRoute(payload)

      return route
    } catch (error) {
      set({ isLoading: false })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  finalizeRoute: async (routeDraftId, payload) => {
    set({ isFinalizing: true })

    try {
      const route = await routeCreationApi.finalizeRouteDraft(
        routeDraftId,
        payload,
      )

      set({ routeDraft: null })

      return route
    } finally {
      set({ isFinalizing: false })
    }
  },
  resetRouteDraft: () => set({ routeDraft: null }),
}))
