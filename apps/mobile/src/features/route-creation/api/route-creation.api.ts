import {
  CompleteUploadPayload,
  CreateRoutePayload,
  FinalizeRouteDraftPayload,
  GetPresignedUrlPayload,
  PresignedUrlResponse,
  Route,
  RouteDraft,
} from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

export interface GpxFileAsset {
  uri: string
  name: string
  mimeType?: string
}

export const routeCreationApi = {
  async createRoute(payload: CreateRoutePayload): Promise<Route> {
    const { data } = await apiClient.post<Route>('/routes', payload)

    return data
  },
  async uploadGpx(file: GpxFileAsset): Promise<RouteDraft> {
    const formData = new FormData()

    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? 'application/gpx+xml',
    } as unknown as Blob)

    const { data } = await apiClient.post<RouteDraft>(
      '/routes-draft/import-gpx',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    return data
  },
  async finalizeRouteDraft(
    routeDraftId: string,
    payload: FinalizeRouteDraftPayload,
  ): Promise<Route> {
    const { data } = await apiClient.post<Route>(
      `/routes-draft/${routeDraftId}/finalize`,
      payload,
    )

    return data
  },

  async getPresignedUrl(
    routeDraftId: string,
    payload: GetPresignedUrlPayload,
  ): Promise<PresignedUrlResponse> {
    const { data } = await apiClient.post<PresignedUrlResponse>(
      `/routes-draft/${routeDraftId}/images/presigned`,
      payload,
    )

    return data
  },

  async completeImageUpload(
    routeDraftId: string,
    payload: CompleteUploadPayload,
  ): Promise<void> {
    await apiClient.post<void>(
      `/routes-draft/${routeDraftId}/images/complete`,
      payload,
    )
  },

  async deleteImage(routeDraftId: string, imageId: string): Promise<void> {
    await apiClient.delete<void>(
      `/routes-draft/${routeDraftId}/images/${imageId}`,
    )
  },
}
