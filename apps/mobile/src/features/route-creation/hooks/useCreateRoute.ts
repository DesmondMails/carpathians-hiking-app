import { useRouteCreationStore } from '../store/route-creation.store'

export const useCreateRoute = () => {
  const isLoading = useRouteCreationStore((state) => state.isLoading)
  const isFinalizing = useRouteCreationStore((state) => state.isFinalizing)
  const routeDraft = useRouteCreationStore((state) => state.routeDraft)
  const uploadGpx = useRouteCreationStore((state) => state.uploadGpx)
  const createRoute = useRouteCreationStore((state) => state.createRoute)
  const finalizeRoute = useRouteCreationStore((state) => state.finalizeRoute)
  const resetRouteDraft = useRouteCreationStore(
    (state) => state.resetRouteDraft,
  )

  return {
    isLoading,
    isFinalizing,
    routeDraft,
    uploadGpx,
    createRoute,
    finalizeRoute,
    resetRouteDraft,
  }
}
