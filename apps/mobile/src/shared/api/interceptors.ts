import axios from 'axios'
import { apiClient } from './client'
import { tokenStorage } from './token-storage'
import type { LoginResponse } from '@hiking/shared'
import { getBaseUrl } from './getBaseUrl'

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = await tokenStorage.getRefreshToken()

        if (!refreshToken) {
          return Promise.reject(error)
        }

        const { data } = await axios.post<LoginResponse>(
          `${getBaseUrl()}/auth/refresh`,
          { refreshToken },
        )

        await tokenStorage.setAccessToken(data.accessToken)
        await tokenStorage.setRefreshToken(data.refreshToken)

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(originalRequest)
      } catch {
        await tokenStorage.clearTokens()

        const { useAuthStore } =
          await import('@/src/features/auth/store/auth.store')
        useAuthStore.getState().logout()

        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)
