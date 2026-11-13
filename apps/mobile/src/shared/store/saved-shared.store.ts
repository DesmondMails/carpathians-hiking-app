import { create } from 'zustand'

import { useExploreStore } from '@/src/features/explore/store/explore.store'
import { useRouteStore } from '@/src/features/route/store/route.store'
import { useSavedStore } from '@/src/features/saved/store/saved.store'

import { toast } from './toast.store'
import { saveRouteSharedApi } from '../api/saveRouteSharedApi'
import { getErrorMessage } from '../utils/getErrorMessage'

interface SharedSavedRouteStore {
  saveRoute: (routeId: string) => void
  unsaveRoute: (routeId: string) => void
}

export const useSharedSavedRouteStore = create<SharedSavedRouteStore>(() => ({
  saveRoute: async (routeId: string) => {
    try {
      const savedRouteInfo = await saveRouteSharedApi.saveRoute(routeId)

      useExploreStore
        .getState()
        .changeIsSavedStatus(savedRouteInfo.routeId, true)
      useRouteStore
        .getState()
        .changeIsSavedStatus(savedRouteInfo.routeId, true)

      useSavedStore.getState().loadSavedRoutes()

      toast.success('Маршрут збережено.')
    } catch (error) {
      const errMessage = getErrorMessage(
        error,
        'Не вдалось зберегти маршрут. Спробуйте будь ласка пізніше'
      )

      toast.error(errMessage)
    }
  },
  unsaveRoute: async (routeId: string) => {
    try {
      await saveRouteSharedApi.deleteRouteSaved(routeId)

      useExploreStore.getState().changeIsSavedStatus(routeId, false)
      useRouteStore.getState().changeIsSavedStatus(routeId, false)
      useSavedStore.getState().removeFromSaved(routeId)

      toast.success('Маршрут видалено зі збережених.')
    } catch (error) {
      const errMessage = getErrorMessage(
        error,
        'Не вдалось видалити зі збережених маршрут. Спробуйте будь ласка пізніше'
      )

      toast.error(errMessage)
    }
  },
}))
