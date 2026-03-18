import { apiClient } from '@/src/shared/api/client'
import { PublicUser, LoginResponse, SignupResponse } from '@hiking/shared'

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
      payload,
    )

    return data
  },

  async verifyEmail(payload: VerifyEmailPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      '/auth/verify-email',
      payload,
    )

    return data
  },

  async resendCode(payload: ResendCodePayload): Promise<void> {
    await apiClient.post('/auth/resend-code', payload)
  },

  async me(): Promise<PublicUser> {
    const { data } = await apiClient.get<PublicUser>('/auth/me')

    return data
  },

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/refresh', {
      refreshToken,
    })

    return data
  },

  async logout(): Promise<void> {
    const { data } = await apiClient.post('/auth/logout')

    return data
  },

  async googleLogin(idToken: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      '/auth/google/native',
      { idToken },
    )

    return data
  },
}
