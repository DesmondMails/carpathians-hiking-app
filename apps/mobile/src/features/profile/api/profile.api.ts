import { PublicUser } from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

export const profileApi = {
  async me(): Promise<PublicUser> {
    const { data } = await apiClient.get<PublicUser>('/users/me')

    return data
  },

  async updateMe(payload: { name: string }): Promise<PublicUser> {
    const { data } = await apiClient.patch<PublicUser>('/users/me', payload)

    return data
  },
}
