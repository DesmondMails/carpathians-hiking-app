import { useExploreStore } from '../store/explore.store'

export const useExplore = () => {
  const routes = useExploreStore((state) => state.routes)
  const isLoading = useExploreStore((state) => state.isLoading)
  const isRefreshing = useExploreStore((state) => state.isRefreshing)
  const isLoadingMore = useExploreStore((state) => state.isLoadingMore)
  const hasLoaded = useExploreStore((state) => state.hasLoaded)
  const resultsVersion = useExploreStore((state) => state.resultsVersion)
  const refreshError = useExploreStore((state) => state.refreshError)
  const loadMoreError = useExploreStore((state) => state.loadMoreError)
  const appliedFilters = useExploreStore((state) => state.appliedFilters)
  const appliedSearchPayload = useExploreStore(
    (state) => state.appliedSearchPayload
  )
  const applyFilters = useExploreStore((state) => state.applyFilters)
  const loadRoutes = useExploreStore((state) => state.loadRoutes)
  const loadMore = useExploreStore((state) => state.loadMore)
  const applySearchText = useExploreStore((state) => state.applySearchText)
  const retryRefresh = useExploreStore((state) => state.retryRefresh)
  const retryLoadMore = useExploreStore((state) => state.retryLoadMore)

  return {
    routes,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasLoaded,
    resultsVersion,
    refreshError,
    loadMoreError,
    appliedFilters,
    appliedSearchPayload,
    applyFilters,
    loadRoutes,
    loadMore,
    applySearchText,
    retryRefresh,
    retryLoadMore,
  }
}
