import { Redirect, Tabs } from 'expo-router'

import { useAuth } from '@/src/features/auth/hooks/useAuth'
import { CustomTabBar } from '@/src/shared/components/CustomTabBar'

export default function AppLayout() {
  const { isAuthenticated, isHydrated } = useAuth()

  if (!isHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return <Redirect href='/(auth)/login' />
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name='index' />
      <Tabs.Screen name='explore' />
      <Tabs.Screen name='history' />
      <Tabs.Screen name='profile' />
    </Tabs>
  )
}
