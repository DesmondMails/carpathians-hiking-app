import type { LoginResponse } from '@hiking/shared'
import axios from 'axios'

import { isAuthRejection } from './auth-error'
import { apiClient } from './client'
import { getBaseUrl } from './getBaseUrl'
import { tokenStorage } from './token-storage'

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
      } catch (refreshError) {
        // Couldn't reach the server: keep the session and surface the real error
        if (!isAuthRejection(refreshError)) {
          return Promise.reject(refreshError)
        }

        const { useAuthStore } =
          await import('@/src/features/auth/store/auth.store')
        await useAuthStore.getState().clearSession()

        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)
