import { Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { usePathname, useRouter } from 'expo-router'
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors } from '@/src/theme/colors'

import { AnimatedPressable } from './AnimatedPressable'

type TabName = 'index' | 'explore' | 'history' | 'profile'

const TAB_CONFIG: Record<TabName, { icon: string }> = {
  index: { icon: 'home' },
  explore: { icon: 'compass' },
  history: { icon: 'clock' },
  profile: { icon: 'user' },
}

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const pressProgress = useSharedValue(0)
  const router = useRouter()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 - 0.04 * pressProgress.value },
      { translateY: 1.5 * pressProgress.value },
    ],
  }))

  if (pathname.startsWith('/routes/')) return null

  const handleAddRoute = () => {
    router.push('/(modals)/create-route')
  }

  const renderTab = (routeIndex: number) => {
    const route = state.routes[routeIndex]
    const isFocused = state.index === routeIndex
    const tabKey = route.name as TabName
    const config = TAB_CONFIG[tabKey]

    if (!config) return null

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      })
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name)
      }
    }

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        style={styles.tab}
        accessibilityRole='tab'
        accessibilityState={{ selected: isFocused }}
      >
        <Feather
          name={config.icon as any}
          size={24}
          color={isFocused ? colors.primary : colors.textLightGray}
        />
      </Pressable>
    )
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.bar}>
        {renderTab(0)}
        {renderTab(1)}

        <View style={styles.centerSlot}>
          <View style={styles.socket}>
            <AnimatedPressable
              onPressIn={() => {
                pressProgress.value = withSpring(1, {
                  damping: 16,
                  stiffness: 380,
                })
              }}
              onPressOut={() => {
                pressProgress.value = withSpring(0, {
                  damping: 14,
                  stiffness: 320,
                })
              }}
              onPress={handleAddRoute}
              style={[styles.centerButton, animatedStyle]}
              accessibilityLabel='Add route'
              accessibilityRole='button'
            >
              <Feather name='plus' size={20} color={colors.white} />
            </AnimatedPressable>
          </View>
        </View>

        {renderTab(2)}
        {renderTab(3)}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.transparentDark,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 8,
    width: '92%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  socket: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
})
