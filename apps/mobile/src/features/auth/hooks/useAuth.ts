import { useAuthStore } from '../store/auth.store'

export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const login = useAuthStore((state) => state.login)
  const signup = useAuthStore((state) => state.signup)
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)
  const verifyEmail = useAuthStore((state) => state.verifyEmail)
  const resendCode = useAuthStore((state) => state.resendCode)
  const logout = useAuthStore((state) => state.logout)
  const hydrate = useAuthStore((state) => state.hydrate)

  return {
    user,
    isAuthenticated,
    isLoading,
    isHydrated,
    login,
    signup,
    signInWithGoogle,
    verifyEmail,
    resendCode,
    logout,
    hydrate,
  }
}
