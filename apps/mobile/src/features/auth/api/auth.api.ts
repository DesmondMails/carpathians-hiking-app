import { LoginResponse, SignupResponse } from '@hiking/shared'

import { apiClient } from '@/src/shared/api/client'

import {
  LoginPayload,
  SignupPayload,
  VerifyEmailPayload,
  ResendCodePayload,
} from '../types'

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload)

    return data
  },

  async signup(payload: SignupPayload): Promise<SignupResponse> {
    const { data } = await apiClient.post<SignupResponse>(
      '/auth/signup',
      payload
    )

    return data
  },

  async verifyEmail(payload: VerifyEmailPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      '/auth/verify-email',
      payload
    )

    return data
  },

  async resendCode(payload: ResendCodePayload): Promise<void> {
    await apiClient.post('/auth/resend-code', payload)
  },

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/refresh', {
      refreshToken,
    })

    return data
  },

  // Token is passed explicitly: local storage is already cleared by the time this runs
  async logout(accessToken: string): Promise<void> {
    await apiClient.post('/auth/logout', undefined, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  async googleLogin(idToken: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      '/auth/google/native',
      { idToken }
    )

    return data
  },
}
