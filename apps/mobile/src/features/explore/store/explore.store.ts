import {
  DEFAULT_LIMIT,
  RouteListItem,
  SearchRoutePayload,
} from '@hiking/shared'
import { create } from 'zustand'

import { toast } from '@/src/shared/store/toast.store'
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage'

import { exploreApi } from '../api/explore.api'
import { DEFAULT_FORM_VALUES } from '../constants'
import type { SearchFormValues } from '../schemas/search.schema'

type AppliedSearchPayload = Omit<SearchRoutePayload, 'limit' | 'offset'>
interface ExploreState {
  isLoading: boolean
  isLoadingMore: boolean
  hasLoaded: boolean
  hasMore: boolean
  error: string | null
  routes: RouteListItem[]
  offset: number
  appliedFilters: SearchFormValues
  appliedSearchPayload: AppliedSearchPayload
  applyFilters: (
    filters: SearchFormValues,
    payload: AppliedSearchPayload
  ) => Promise<boolean>
  applySearchText: (searchText: string) => Promise<boolean>
  loadRoutes: () => Promise<boolean>
  loadMore: () => Promise<boolean>
}

export const useExploreStore = create<ExploreState>((set, get) => {
  let searchVersion = 0

  const loadPage = async (append: boolean): Promise<boolean> => {
    const state = get()

    const shouldNotLoad =
      append &&
      (state.isLoading ||
        state.isLoadingMore ||
        !state.hasMore ||
        !state.hasLoaded)

    if (shouldNotLoad) {
      return false
    }

    const version = append ? searchVersion : ++searchVersion
    const offset = append ? state.offset : 0
    const payload = state.appliedSearchPayload

    set(
      append
        ? { isLoadingMore: true, error: null }
        : {
            isLoading: true,
            isLoadingMore: false,
            error: null,
            routes: [],
            offset: 0,
            hasMore: true,
            hasLoaded: false,
          }
    )

    try {
      const page = await exploreApi.loadRoutes({
        ...payload,
        limit: DEFAULT_LIMIT,
        offset,
      })

      if (version !== searchVersion) return false

      set((current) => {
        const existingIds = new Set(current.routes.map((route) => route.id))
        const routes = append
          ? [
              ...current.routes,
              ...page.filter((route) => !existingIds.has(route.id)),
            ]
          : page

        return {
          routes,
          offset: offset + page.length,
          hasMore: page.length === DEFAULT_LIMIT,
          hasLoaded: true,
        }
      })
      return true
    } catch (error) {
      if (version !== searchVersion) return false

      const message = getErrorMessage(
        error,
        'Не вдалося завантажити маршрути. Спробуйте ще раз.'
      )
      set({ error: message })

      toast.error(message)
      return false
    } finally {
      if (version === searchVersion) {
        set({ isLoading: false, isLoadingMore: false })
      }
    }
  }

  return {
    isLoading: false,
    isLoadingMore: false,
    hasLoaded: false,
    hasMore: true,
    error: null,
    routes: [],
    offset: 0,
    appliedFilters: DEFAULT_FORM_VALUES,
    appliedSearchPayload: {},

    applyFilters: (filters, payload) => {
      set({
        appliedFilters: filters,
        appliedSearchPayload: {
          ...payload,
          searchText: get().appliedSearchPayload.searchText,
        },
      })

      return loadPage(false)
    },
    applySearchText: (searchText: string) => {
      const normalizedText = searchText.trim() || undefined

      if (normalizedText === get().appliedSearchPayload.searchText) {
        return Promise.resolve(false)
      }
      set({
        appliedSearchPayload: {
          ...get().appliedSearchPayload,
          searchText: normalizedText,
        },
      })

      return loadPage(false)
    },
    loadRoutes: () => {
      if (get().isLoading || get().hasLoaded) return Promise.resolve(false)

      return loadPage(false)
    },
    loadMore: () => loadPage(true),
  }
})
