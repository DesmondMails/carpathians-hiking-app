import { useExploreStore } from '../store/explore.store'

export const useExplore = () => {
  const routes = useExploreStore((state) => state.routes)
  const isLoading = useExploreStore((state) => state.isLoading)
  const isLoadingMore = useExploreStore((state) => state.isLoadingMore)
  const error = useExploreStore((state) => state.error)
  const appliedFilters = useExploreStore((state) => state.appliedFilters)
  const appliedSearchPayload = useExploreStore(
    (state) => state.appliedSearchPayload
  )
  const applyFilters = useExploreStore((state) => state.applyFilters)
  const loadRoutes = useExploreStore((state) => state.loadRoutes)
  const loadMore = useExploreStore((state) => state.loadMore)
  const applySearchText = useExploreStore((state) => state.applySearchText)

  return {
    routes,
    isLoading,
    isLoadingMore,
    error,
    appliedFilters,
    appliedSearchPayload,
    applyFilters,
    loadRoutes,
    loadMore,
    applySearchText,
  }
}
