import { PublicUser, SignupResponse } from '@hiking/shared'
import { create } from 'zustand'

import { tokenStorage } from '@/src/shared/api/token-storage'

import { authApi } from '../api/auth.api'
import { signInWithGoogle } from '../lib/google'
import {
  LoginPayload,
  SignupPayload,
  VerifyEmailPayload,
  ResendCodePayload,
} from '../types'

interface AuthState {
  user: PublicUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean

  login: (payload: LoginPayload) => Promise<void>
  signup: (payload: SignupPayload) => Promise<SignupResponse>
  verifyEmail: (payload: VerifyEmailPayload) => Promise<void>
  confirmAuthentication: () => void
  resendCode: (payload: ResendCodePayload) => Promise<void>
  logout: () => Promise<void>
  hydrate: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,

  login: async (payload) => {
    set({ isLoading: true })

    try {
      const response = await authApi.login(payload)

      await tokenStorage.setAccessToken(response.accessToken)
      await tokenStorage.setRefreshToken(response.refreshToken)

      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true })

    try {
      const { idToken } = await signInWithGoogle()

      if (!idToken) {
        throw new Error('Немає токену Google')
      }

      const res = await authApi.googleLogin(idToken)

      await tokenStorage.setAccessToken(res.accessToken)
      await tokenStorage.setRefreshToken(res.refreshToken)

      set({
        user: res.user,
        accessToken: res.accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })

      throw error
    }
  },

  signup: async (payload) => {
    set({ isLoading: true })

    try {
      const response = await authApi.signup(payload)

      set({ isLoading: false })

      return response
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  verifyEmail: async (payload) => {
    set({ isLoading: true })

    try {
      const response = await authApi.verifyEmail(payload)

      await tokenStorage.setAccessToken(response.accessToken)
      await tokenStorage.setRefreshToken(response.refreshToken)

      set({
        user: response.user,
        accessToken: response.accessToken,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  confirmAuthentication: () => {
    set({ isAuthenticated: true })
  },

  resendCode: async (payload) => {
    await authApi.resendCode(payload)
  },

  logout: async () => {
    await tokenStorage.clearTokens()

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    })
  },

  hydrate: async () => {
    set({ isLoading: true })

    try {
      const accessToken = await tokenStorage.getAccessToken()
      const refreshToken = await tokenStorage.getRefreshToken()

      if (!accessToken && !refreshToken) {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          isHydrated: true,
        })

        return
      }

      const user = await authApi.me()
      const currentToken = await tokenStorage.getAccessToken()

      set({
        user,
        accessToken: currentToken,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      })
    } catch {
      await tokenStorage.clearTokens()

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isHydrated: true,
      })
    }
  },
}))
