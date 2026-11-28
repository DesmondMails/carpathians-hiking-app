import { GetHomePayload, HomeKindWithList, HomeResponse } from '@hiking/shared'
import { create } from 'zustand'

import { getErrorMessage } from '@/src/shared/utils/getErrorMessage'

import { homepageApi } from '../api/homepage.api'

interface HomepageState {
  isLoading: boolean
  homepageData: HomeResponse | null
  homepageError: string
  // Kept so a retry repeats the request with the same coordinates
  lastPayload?: GetHomePayload

  loadHomePageData: (payload?: GetHomePayload) => Promise<void>
  reloadHomePageData: () => Promise<void>
  changeIsSavedStatus: (routeId: string, status: boolean) => void
}

export const useHomepageStore = create<HomepageState>((set, get) => ({
  homepageData: null,
  isLoading: false,
  homepageError: '',

  loadHomePageData: async (payload) => {
    set({ isLoading: true, homepageError: '', lastPayload: payload })

    try {
      const homepageData = await homepageApi.getHomeData(payload)

      set({ homepageData })
    } catch (error) {
      const errMessage = getErrorMessage(
        error,
        'Не вдалось завантажити домашню сторінку.'
      )

      set({ homepageError: errMessage })
    } finally {
      set({ isLoading: false })
    }
  },
  reloadHomePageData: () => get().loadHomePageData(get().lastPayload),
  // Updated by id in both lists: save/unsave can come from any screen, and
  // the store does not need to know which card triggered it
  changeIsSavedStatus: (routeId, status) => {
    const data = get().homepageData

    if (!data) {
      return
    }

    const updateList = (list: HomeKindWithList): HomeKindWithList => ({
      ...list,
      routes: list.routes.map((route) =>
        route.id === routeId ? { ...route, isSaved: status } : route
      ),
    })

    set({
      homepageData: {
        carousel: updateList(data.carousel),
        recommendations: updateList(data.recommendations),
      },
    })
  },
}))
