import {
  DEFAULT_LIMIT,
  RouteListItem,
  SearchRoutePayload,
} from '@hiking/shared'
import { create } from 'zustand'

import { getErrorMessage } from '@/src/shared/utils/getErrorMessage'

import { exploreApi } from '../api/explore.api'
import { DEFAULT_FORM_VALUES, PAGE_REQUEST, PageRequest } from '../constants'
import type { SearchFormValues } from '../schemas/search.schema'

type AppliedSearchPayload = Omit<SearchRoutePayload, 'limit' | 'offset'>

interface ExploreState {
  // First page while nothing has been shown yet
  isLoading: boolean
  // First page of a new search while previous results stay visible
  isRefreshing: boolean
  isLoadingMore: boolean
  // A first page has loaded at least once, so `routes` is a real result
  hasLoaded: boolean
  hasMore: boolean
  refreshError: string | null
  loadMoreError: string | null
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
  retryRefresh: () => Promise<boolean>
  retryLoadMore: () => Promise<boolean>
}

// Next pages only extend results of the current, successfully loaded search
const canLoadNextPage = (state: ExploreState): boolean =>
  state.hasLoaded &&
  state.hasMore &&
  !state.isLoading &&
  !state.isRefreshing &&
  !state.isLoadingMore &&
  !state.refreshError

export const useExploreStore = create<ExploreState>((set, get) => {
  let searchVersion = 0

  const loadPage = async (request: PageRequest): Promise<boolean> => {
    const state = get()
    const isNextPage = request === PAGE_REQUEST.NEXT

    if (isNextPage && !canLoadNextPage(state)) {
      return false
    }

    const version = isNextPage ? searchVersion : ++searchVersion
    const offset = isNextPage ? state.offset : 0
    const payload = state.appliedSearchPayload
    const loadingFlag = isNextPage
      ? 'isLoadingMore'
      : state.hasLoaded
        ? 'isRefreshing'
        : 'isLoading'

    set(
      isNextPage
        ? { isLoadingMore: true, loadMoreError: null }
        : {
            isLoading: !state.hasLoaded,
            isRefreshing: state.hasLoaded,
            isLoadingMore: false,
            refreshError: null,
            loadMoreError: null,
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
        const routes = isNextPage
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
      set(isNextPage ? { loadMoreError: message } : { refreshError: message })
      return false
    } finally {
      if (version === searchVersion) {
        set({ [loadingFlag]: false })
      }
    }
  }

  return {
    isLoading: false,
    isRefreshing: false,
    isLoadingMore: false,
    hasLoaded: false,
    hasMore: true,
    refreshError: null,
    loadMoreError: null,
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

      return loadPage(PAGE_REQUEST.FIRST)
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

      return loadPage(PAGE_REQUEST.FIRST)
    },
    loadRoutes: () => {
      const { isLoading, isRefreshing, hasLoaded } = get()

      if (isLoading || isRefreshing || hasLoaded) return Promise.resolve(false)

      return loadPage(PAGE_REQUEST.FIRST)
    },
    loadMore: () => {
      if (get().loadMoreError) return Promise.resolve(false)

      return loadPage(PAGE_REQUEST.NEXT)
    },
    // The failed first page used the payload that is still applied
    retryRefresh: () => {
      if (!get().refreshError) return Promise.resolve(false)

      return loadPage(PAGE_REQUEST.FIRST)
    },
    // `offset` only advances on success, so this re-requests the failed page
    retryLoadMore: () => {
      if (!get().loadMoreError) return Promise.resolve(false)

      return loadPage(PAGE_REQUEST.NEXT)
    },
  }
})
