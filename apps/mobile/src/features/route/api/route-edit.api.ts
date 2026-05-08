import {
  CompleteRouteImageUploadPayload,
  EditableRoute,
  GetPresignedUrlPayload,
  PresignedUrlResponse,
  SetRouteCoverPayload,
  UpdateRoutePayload,
} from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

export const routeEditApi = {
  async getEditableRoute(routeId: string): Promise<EditableRoute> {
    const { data } = await apiClient.get<EditableRoute>(`/routes/${routeId}/edit`)

    return data
  },

  async updateRoute(
    routeId: string,
    payload: UpdateRoutePayload,
  ): Promise<void> {
    await apiClient.patch(`/routes/${routeId}`, payload)
  },

  async getPresignedUrl(
    routeId: string,
    payload: GetPresignedUrlPayload,
  ): Promise<PresignedUrlResponse> {
    const { data } = await apiClient.post<PresignedUrlResponse>(
      `/routes/${routeId}/images/presigned`,
      payload,
    )

    return data
  },

  async completeImageUpload(
    routeId: string,
    payload: CompleteRouteImageUploadPayload,
  ): Promise<void> {
    await apiClient.post(`/routes/${routeId}/images/complete`, payload)
  },

  async deleteImage(routeId: string, imageId: string): Promise<void> {
    await apiClient.delete(`/routes/${routeId}/images/${imageId}`)
  },

  async setCoverImage(
    routeId: string,
    payload: SetRouteCoverPayload,
  ): Promise<void> {
    await apiClient.patch(`/routes/${routeId}/cover`, payload)
  },
}
