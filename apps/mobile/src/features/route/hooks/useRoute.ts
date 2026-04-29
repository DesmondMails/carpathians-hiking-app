import { useRouteStore } from '../store/route.store'

export const useRoute = () => {
  const isLoading = useRouteStore((state) => state.isLoading)
  const route = useRouteStore((state) => state.route)
  const loadRoute = useRouteStore((state) => state.loadRoute)
  const loadGpxUrl = useRouteStore((state) => state.loadGpxUrl)

  return {
    isLoading,
    route,
    loadRoute,
    loadGpxUrl,
  }
}
