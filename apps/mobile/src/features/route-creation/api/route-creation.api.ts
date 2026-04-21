import {
  CreateRoutePayload,
  FinalizeRouteDraftPayload,
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
}
