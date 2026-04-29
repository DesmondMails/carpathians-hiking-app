import { useCallback, useEffect, useState } from 'react'

import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import * as Font from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useAuthStore } from '@/src/features/auth/store/auth.store'
import { AnimatedSplash } from '@/src/features/splash/AnimatedSplash'
import '@/src/shared/api/interceptors'
import { ToastHost } from '@/src/shared/components'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate)
  const [appReady, setAppReady] = useState(false)
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true)
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false)

  const hideNativeSplash = useCallback(async () => {
    if (!nativeSplashHidden) {
      await SplashScreen.hideAsync()
      setNativeSplashHidden(true)
    }
  }, [nativeSplashHidden])

  const preloadFonts = async () => {
    await Font.loadAsync({
      'Mont-Bold': require('@/assets/fonts/Mont-Bold.ttf'),
      'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
      'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
      'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    })
  }

  useEffect(() => {
    async function prepare() {
      try {
        await preloadFonts()
        await hydrate()
      } finally {
        setAppReady(true)
      }
    }
    prepare()
  }, [])

  useEffect(() => {
    if (appReady) {
      hideNativeSplash()
    }
  }, [appReady, hideNativeSplash])

  if (!appReady) {
    return null
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name='(app)' options={{ headerShown: false }} />
          <Stack.Screen name='(auth)' options={{ headerShown: false }} />
          <Stack.Screen
            name='(modals)'
            options={{ presentation: 'fullScreenModal', headerShown: false }}
          />
        </Stack>
        <StatusBar style='auto' />

        <ToastHost />

        {showAnimatedSplash ? (
          <AnimatedSplash onFinish={() => setShowAnimatedSplash(false)} />
        ) : null}
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
