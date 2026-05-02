import {
  CompleteUploadPayload,
  CreateRoutePayload,
  FinalizeRouteDraftPayload,
  GetPresignedUrlPayload,
  PresignedUrlResponse,
  Route,
  RouteDraft,
} from '@hiking/shared'
import { create } from 'zustand'

import { GpxFileAsset, routeCreationApi } from '../api/route-creation.api'

interface RouteCreationState {
  isLoading: boolean
  isFinalizing: boolean
  routeDraft: RouteDraft | null

  uploadGpx: (file: GpxFileAsset) => Promise<RouteDraft>
  createRoute: (payload: CreateRoutePayload) => Promise<Route>
  finalizeRoute: (
    routeDraftId: string,
    payload: FinalizeRouteDraftPayload,
  ) => Promise<Route>
  resetRouteDraft: () => void
  getPresignedUrl: (
    routeDraftId: string,
    payload: GetPresignedUrlPayload,
  ) => Promise<PresignedUrlResponse>
  completeImageUpload: (
    routeDraftId: string,
    payload: CompleteUploadPayload,
  ) => Promise<void>
  deleteImage: (routeDraftId: string, imageId: string) => Promise<void>
}

export const useRouteCreationStore = create<RouteCreationState>((set) => ({
  isLoading: false,
  isFinalizing: false,
  routeDraft: null,
  uploadGpx: async (file) => {
    set({ isLoading: true })

    try {
      const routeDraft = await routeCreationApi.uploadGpx(file)

      set({ routeDraft })

      return routeDraft
    } catch (error) {
      set({ isLoading: false })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  createRoute: async (payload) => {
    set({ isLoading: true })

    try {
      const route = await routeCreationApi.createRoute(payload)

      return route
    } catch (error) {
      set({ isLoading: false })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  finalizeRoute: async (routeDraftId, payload) => {
    set({ isFinalizing: true })

    try {
      const route = await routeCreationApi.finalizeRouteDraft(
        routeDraftId,
        payload,
      )

      set({ routeDraft: null })

      return route
    } finally {
      set({ isFinalizing: false })
    }
  },
  resetRouteDraft: () => set({ routeDraft: null }),
  getPresignedUrl: async (routeDraftId, payload) => {
    set({ isLoading: true })

    try {
      const presignedUrlData = await routeCreationApi.getPresignedUrl(
        routeDraftId,
        payload,
      )

      return presignedUrlData
    } catch (error) {
      set({ isLoading: false })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  completeImageUpload: async (routeDraftId, payload) => {
    set({ isLoading: true })

    try {
      await routeCreationApi.completeImageUpload(routeDraftId, payload)
    } catch (error) {
      set({ isLoading: false })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  deleteImage: async (routeDraftId, imageId) => {
    set({ isLoading: true })

    try {
      await routeCreationApi.deleteImage(routeDraftId, imageId)
    } catch (error) {
      set({ isLoading: false })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
}))
