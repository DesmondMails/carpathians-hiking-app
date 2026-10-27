import { useExploreStore } from '../store/explore.store'

export const useExplore = () => {
  const routes = useExploreStore((state) => state.routes)
  const isLoading = useExploreStore((state) => state.isLoading)
  const isLoadingMore = useExploreStore((state) => state.isLoadingMore)
  const error = useExploreStore((state) => state.error)
  const appliedFilters = useExploreStore((state) => state.appliedFilters)
  const applyFilters = useExploreStore((state) => state.applyFilters)
  const loadRoutes = useExploreStore((state) => state.loadRoutes)
  const loadMore = useExploreStore((state) => state.loadMore)

  return {
    routes,
    isLoading,
    isLoadingMore,
    error,
    appliedFilters,
    applyFilters,
    loadRoutes,
    loadMore,
  }
}
