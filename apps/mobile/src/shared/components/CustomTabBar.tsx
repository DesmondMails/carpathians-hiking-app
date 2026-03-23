import { Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'


import { AppText } from './AppText'


type TabName = 'index' | 'explore' | 'history' | 'profile'

const TAB_CONFIG: Record<TabName, { icon: string; label: string }> = {
  index: { icon: 'home', label: 'Home' },
  explore: { icon: 'compass', label: 'Explore' },
  history: { icon: 'clock', label: 'History' },
  profile: { icon: 'user', label: 'Profile' },
}

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index
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
              style={[styles.tab, isFocused && styles.tabActive]}
            >
              <Feather
                name={config.icon as any}
                size={22}
                color={isFocused ? colors.white : 'rgba(255,255,255,0.6)'}
              />
              {isFocused && (
                <AppText style={styles.label}>{config.label}</AppText>
              )}
            </Pressable>
          )
        })}
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,30,30,0.65)',
    borderRadius: 1000,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
    width: '90%',
    justifyContent: 'space-between',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 1000,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.white,
    fontFamily: typography.button.fontFamily,
    fontSize: 15,
  },
})
