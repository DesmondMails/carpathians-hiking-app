import { CreateRoutePayload, Route } from '@hiking/shared'
import { create } from 'zustand'

import { routeCreationApi } from '../api/route-creation.api'

interface RouteCreationState {
  isLoading: boolean

  createRoute: (payload: CreateRoutePayload) => Promise<Route>
}

export const useRouteCreationStore = create<RouteCreationState>((set) => ({
  isLoading: false,

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
}))
