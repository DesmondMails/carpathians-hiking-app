import { useSavedStore } from '../store/saved.store'

export const useSaved = () => {
  const savedRoutes = useSavedStore((state) => state.savedRoutes)
  const isLoading = useSavedStore((state) => state.isLoading)
  const isLoadingMore = useSavedStore((state) => state.isLoadingMore)
  const loadError = useSavedStore((state) => state.loadError)
  const loadSavedRoutes = useSavedStore((state) => state.loadSavedRoutes)
  const loadMoreRoutes = useSavedStore((state) => state.loadMoreRoutes)

  return {
    savedRoutes,
    isLoading,
    isLoadingMore,
    loadError,
    loadSavedRoutes,
    loadMoreRoutes,
  }
}
