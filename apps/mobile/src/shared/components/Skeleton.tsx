import { FC, ReactNode, useEffect } from 'react'

import { DimensionValue, StyleProp, View, ViewStyle } from 'react-native'

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { colors } from '@/src/theme/colors'

interface SkeletonBlockProps {
  width?: DimensionValue
  height: number
  radius?: number
  style?: StyleProp<ViewStyle>
}

export const SkeletonBlock: FC<SkeletonBlockProps> = ({
  width = '100%',
  height,
  radius = 6,
  style,
}) => (
  <View
    style={[
      { width, height, borderRadius: radius, backgroundColor: colors.gray200 },
      style,
    ]}
  />
)

interface SkeletonPulseProps {
  children: ReactNode
  label?: string
  style?: StyleProp<ViewStyle>
}

// One animation for the whole subtree, so every block pulses in sync
export const SkeletonPulse: FC<SkeletonPulseProps> = ({
  children,
  label = 'Завантаження…',
  style,
}) => {
  const opacity = useSharedValue(1)
  const reduceMotion = useReducedMotion()
  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  useEffect(() => {
    if (!reduceMotion) {
      opacity.value = withRepeat(
        withTiming(0.45, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      )
    }

    return () => cancelAnimation(opacity)
  }, [reduceMotion, opacity])

  return (
    <Animated.View
      style={[style, pulseStyle]}
      accessible
      accessibilityRole='progressbar'
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
    >
      {children}
    </Animated.View>
  )
}
