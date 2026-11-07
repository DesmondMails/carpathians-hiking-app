import { PublicUser, SignupResponse } from '@hiking/shared'
import { create } from 'zustand'

import { isAuthRejection } from '@/src/shared/api/auth-error'
import { tokenStorage } from '@/src/shared/api/token-storage'

import { profileApi } from '../../profile/api/profile.api'
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
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean

  login: (payload: LoginPayload) => Promise<void>
  signup: (payload: SignupPayload) => Promise<SignupResponse>
  verifyEmail: (payload: VerifyEmailPayload) => Promise<void>
  confirmAuthentication: () => void
  resendCode: (payload: ResendCodePayload) => Promise<void>
  logout: () => Promise<void>
  // Local-only sign out, no server call. Used when the server already rejected the session.
  clearSession: () => Promise<void>
  hydrate: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  updateProfile: (payload: { name: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
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
    const accessToken = await tokenStorage.getAccessToken()

    await get().clearSession()

    // Best effort: the user is already signed out locally, so a failed or slow
    // request here must not block them. The server token expires on its own.
    if (accessToken) {
      authApi.logout(accessToken).catch(() => undefined)
    }
  },

  clearSession: async () => {
    await tokenStorage.clearTokens()

    set({
      user: null,
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
          isAuthenticated: false,
          isLoading: false,
          isHydrated: true,
        })

        return
      }

      const user = await profileApi.me()

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      })
    } catch (error) {
      if (isAuthRejection(error)) {
        await tokenStorage.clearTokens()

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isHydrated: true,
        })

        return
      }

      // Offline, timeout or server error: the session may still be valid,
      // so keep the tokens and let the user in without a loaded profile
      set({
        user: null,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      })
    }
  },
  updateProfile: async (payload) => {
    const user = await profileApi.updateMe(payload)

    set({ user })
  },
}))
