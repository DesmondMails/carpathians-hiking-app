import { useRouteCreationStore } from '../store/route-creation.store'

export const useCreateRoute = () => {
  const isLoading = useRouteCreationStore((state) => state.isLoading)

  const createRoute = useRouteCreationStore((state) => state.createRoute)

  return {
    isLoading,
    createRoute,
  }
}
