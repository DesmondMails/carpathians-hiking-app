import { Route } from '@hiking/shared'
import { create } from 'zustand'

import { homepageApi } from '../api/homepage.api'

interface HomepageState {
  routes: Route[]
  isLoading: boolean

  loadRoutes: () => Promise<void>
}

export const useHomepageStore = create<HomepageState>((set) => ({
  routes: [],
  isLoading: false,

  loadRoutes: async () => {
    set({ isLoading: true })

    try {
      const routes = await homepageApi.getRoutes()

      set({ routes })
    } catch (error) {
      set({ isLoading: false })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
}))
