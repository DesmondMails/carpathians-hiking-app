import { useRouteStore } from '../store/route.store'

export const useRoute = () => {
  const isLoading = useRouteStore((state) => state.isLoading)
  const isPoisLoading = useRouteStore((state) => state.isPoisLoading)
  const poiMarkers = useRouteStore((state) => state.poiMarkers)
  const poiStatus = useRouteStore((state) => state.poiStatus)
  const route = useRouteStore((state) => state.route)
  const loadRoute = useRouteStore((state) => state.loadRoute)
  const loadRoutePois = useRouteStore((state) => state.loadRoutePois)
  const loadGpxUrl = useRouteStore((state) => state.loadGpxUrl)

  return {
    isLoading,
    isPoisLoading,
    poiMarkers,
    poiStatus,
    route,
    loadRoute,
    loadRoutePois,
    loadGpxUrl,
  }
}
