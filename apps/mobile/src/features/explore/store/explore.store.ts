import { RouteListItem, SearchRoutePayload } from '@hiking/shared'
import { create } from 'zustand'

import { toast } from '@/src/shared/store/toast.store'
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage'

import { exploreApi } from '../api/explore.api'

interface ExploreState {
  isLoading: boolean
  error: string | null
  routes: RouteListItem[]
  loadRoutes: (searchPayload: SearchRoutePayload) => Promise<boolean>
}

export const useExploreStore = create<ExploreState>((set, get) => ({
  isLoading: false,
  error: null,
  routes: [],

  loadRoutes: async (searchPayload) => {
    if (get().isLoading) return false

    set({ isLoading: true, error: null })

    try {
      const routes = await exploreApi.loadRoutes(searchPayload)

      set({ routes })
      return true
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Не вдалося завантажити маршрути. Спробуйте ще раз.',
      )

      set({ error: message })

      toast.error(message)

      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
