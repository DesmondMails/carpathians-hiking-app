import { useHomepageStore } from '../store/homepage.store'

export const useHomepage = () => {
  const routes = useHomepageStore((state) => state.routes)
  const isLoading = useHomepageStore((state) => state.isLoading)
  const loadRoutes = useHomepageStore((state) => state.loadRoutes)

  return {
    routes,
    isLoading,
    loadRoutes,
  }
}
