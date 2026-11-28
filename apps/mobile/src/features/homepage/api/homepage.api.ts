import { GetHomePayload, HomeResponse } from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

export const homepageApi = {
  async getHomeData(payload?: GetHomePayload): Promise<HomeResponse> {
    const { data } = await apiClient.get<HomeResponse>('/home', {
      params: {
        ...payload,
      },
    })

    return data
  },
}
