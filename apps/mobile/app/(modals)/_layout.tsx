import { Redirect, Stack } from 'expo-router'

import { useAuth } from '@/src/features/auth/hooks/useAuth'

export default function ModalsLayout() {
  const { isAuthenticated, isHydrated } = useAuth()

  if (!isHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return <Redirect href='/(auth)/login' />
  }
  return (
    <Stack
      screenOptions={{ presentation: 'fullScreenModal', headerShown: false }}
    />
  )
}
