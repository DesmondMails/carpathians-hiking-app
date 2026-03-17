import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@/src/features/auth/hooks/useAuth'

export default function AuthLayout() {
  const { isAuthenticated, isHydrated } = useAuth()

  if (!isHydrated) {
    return null
  }

  if (isAuthenticated) {
    return <Redirect href='/(app)' />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
