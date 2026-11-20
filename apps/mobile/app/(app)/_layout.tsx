import { Stack } from 'expo-router'

import { useAuthStore } from '@/src/features/auth/store/auth.store'

export default function AppLayout() {
  const hasUserPassedOnboarding =
    useAuthStore((state) => state.user?.onboardedAt) !== null

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasUserPassedOnboarding}>
        <Stack.Screen name='(tabs)'></Stack.Screen>
      </Stack.Protected>

      <Stack.Protected guard={!hasUserPassedOnboarding}>
        <Stack.Screen name='onboarding'></Stack.Screen>
      </Stack.Protected>
    </Stack>
  )
}
