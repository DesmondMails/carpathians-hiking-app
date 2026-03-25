import { useHomepageStore } from '../store/homepage.store'

export const useHomepage = () => {
  const routes = useHomepageStore((state) => state.routes)
  const isLoading = useHomepageStore((state) => state.isLoading)
  const loadFavoriteRoutes = useHomepageStore(
    (state) => state.loadFavoriteRoutes,
  )

  return {
    routes,
    isLoading,
    loadFavoriteRoutes,
  }
}
