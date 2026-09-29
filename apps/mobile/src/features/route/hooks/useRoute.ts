import { useRouteStore } from '../store/route.store'

export const useRoute = () => {
  const activeRouteId = useRouteStore((state) => state.activeRouteId)
  const isLoading = useRouteStore((state) => state.isLoading)
  const featuredPoiMarkers = useRouteStore((state) => state.featuredPoiMarkers)
  const allPoiMarkers = useRouteStore((state) => state.allPoiMarkers)
  const poiStatus = useRouteStore((state) => state.poiStatus)
  const route = useRouteStore((state) => state.route)
  const setActiveRouteId = useRouteStore((state) => state.setActiveRouteId)
  const loadRoute = useRouteStore((state) => state.loadRoute)
  const loadRoutePois = useRouteStore((state) => state.loadRoutePois)
  const loadGpxUrl = useRouteStore((state) => state.loadGpxUrl)

  return {
    activeRouteId,
    isLoading,
    featuredPoiMarkers,
    allPoiMarkers,
    poiStatus,
    route,
    setActiveRouteId,
    loadRoute,
    loadRoutePois,
    loadGpxUrl,
  }
}
