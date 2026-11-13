import { RouteListItem } from '@hiking/shared'
import { create } from 'zustand'

import { getErrorMessage } from '@/src/shared/utils/getErrorMessage'

import { savedApi } from '../api/saved.api'
import { SAVED_LOAD_LIMIT } from '../constants'

interface SavedState {
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  offset: number
  savedRoutes: RouteListItem[]
  loadError: string | null
  loadSavedRoutes: () => void
  loadMoreRoutes: () => void
  removeFromSaved: (routeId: string) => void
}

export const useSavedStore = create<SavedState>((set, get) => {
  // Bumped on every reload; responses from an older list are dropped
  let listVersion = 0

  return {
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
    loadError: null,
    offset: 0,
    savedRoutes: [],

    loadSavedRoutes: async () => {
      const version = ++listVersion

      // A pending "load more" belongs to the old list and will be ignored
      set({ isLoading: true, isLoadingMore: false, loadError: null })

      try {
        const savedRoutes = await savedApi.loadSavedRoutes({
          limit: SAVED_LOAD_LIMIT,
          offset: 0,
        })

        if (version !== listVersion) return

        set({
          savedRoutes,
          offset: savedRoutes.length,
          hasMore: savedRoutes.length === SAVED_LOAD_LIMIT,
        })
      } catch (error) {
        if (version !== listVersion) return

        set({
          loadError: getErrorMessage(
            error,
            'Не вдалось завантажити збережені маршрути'
          ),
        })
      } finally {
        if (version === listVersion) {
          set({ isLoading: false })
        }
      }
    },
    removeFromSaved: async (routeId) => {
      const { savedRoutes, offset } = get()
      const filtredRoutes = savedRoutes.filter((route) => route.id !== routeId)

      // The server list shrinks too, so the next page starts one item earlier
      set({
        savedRoutes: filtredRoutes,
        offset: offset - (savedRoutes.length - filtredRoutes.length),
      })
    },
    loadMoreRoutes: async () => {
      const { hasMore, isLoading, isLoadingMore, offset } = get()

      if (!hasMore || isLoading || isLoadingMore) return

      const version = listVersion

      set({ isLoadingMore: true, loadError: null })

      try {
        const page = await savedApi.loadSavedRoutes({
          limit: SAVED_LOAD_LIMIT,
          offset,
        })

        if (version !== listVersion) return

        set((state) => {
          const existingIds = new Set(
            state.savedRoutes.map((route) => route.id)
          )

          return {
            savedRoutes: [
              ...state.savedRoutes,
              ...page.filter((route) => !existingIds.has(route.id)),
            ],
            offset: state.offset + page.length,
            hasMore: page.length === SAVED_LOAD_LIMIT,
          }
        })
      } catch (error) {
        if (version !== listVersion) return

        set({
          loadError: getErrorMessage(
            error,
            'Не вдалось завантажити збережені маршрути'
          ),
        })
      } finally {
        if (version === listVersion) {
          set({ isLoadingMore: false })
        }
      }
    },
  }
})
