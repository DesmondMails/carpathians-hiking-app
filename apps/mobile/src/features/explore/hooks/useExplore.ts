import { useExploreStore } from '../store/explore.store'

export const useExplore = () => {
  const routes = useExploreStore((state) => state.routes)
  const isLoading = useExploreStore((state) => state.isLoading)
  const error = useExploreStore((state) => state.error)
  const loadRoutes = useExploreStore((state) => state.loadRoutes)

  return {
    routes,
    isLoading,
    error,
    loadRoutes,
  }
}
