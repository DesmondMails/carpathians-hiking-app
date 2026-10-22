import { FC, useEffect } from 'react'

import { StyleSheet, View } from 'react-native'

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle, Path } from 'react-native-svg'

import { colors } from '@/src/theme/colors'

import { AppText } from './AppText'

interface RoutesLoaderProps {
  label?: string
}

export const RoutesLoader: FC<RoutesLoaderProps> = ({
  label = 'Шукаємо маршрути…',
}) => {
  const rotation = useSharedValue(0)
  const reduceMotion = useReducedMotion()
  const arcStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  useEffect(() => {
    if (!reduceMotion) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 2400, easing: Easing.linear }),
        -1,
        false,
      )
    }

    return () => cancelAnimation(rotation)
  }, [reduceMotion, rotation])

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole='progressbar'
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion='polite'
    >
      <View style={styles.illustration}>
        <Svg width={120} height={120} viewBox='0 0 120 120'>
          <Path
            d='M 20 82 L 49 43 Q 53 37 57 43 L 84 80 L 68 99 L 36 99 Z'
            fill={colors.primaryDark}
          />
          <Path
            d='M 52 87 L 77 58 Q 81 53 85 59 L 104 84 L 88 100 L 64 102 Z'
            fill={colors.primary}
          />
          <Path
            d='M 20 84 Q 34 76 49 88 T 78 91 Q 91 82 104 85 Q 91 108 62 108 Q 36 107 20 84 Z'
            fill={colors.primaryLight}
          />
          <Path
            d='M 29 95 Q 48 80 66 96 T 96 96'
            fill='none'
            stroke={colors.white}
            strokeWidth={2}
          />
          <Path
            d='M 36 82 C 74 71 41 65 54 47'
            fill='none'
            stroke={colors.white}
            strokeWidth={2.5}
            strokeDasharray='2 5'
            strokeLinecap='round'
          />
          <Circle
            cx={54}
            cy={39}
            r={5.5}
            fill={colors.primary}
            stroke={colors.white}
            strokeWidth={2}
          />
          <Circle cx={54} cy={39} r={1.8} fill={colors.white} />
        </Svg>
        <Animated.View
          pointerEvents='none'
          style={[StyleSheet.absoluteFill, arcStyle]}
        >
          <Svg width={120} height={120} viewBox='0 0 120 120'>
            <Path
              d='M 13 78 A 50 50 0 0 1 50 11'
              fill='none'
              stroke={colors.primaryLight}
              strokeWidth={3}
              strokeLinecap='round'
            />
            <Path
              d='M 61 10 A 50 50 0 0 1 108 74'
              fill='none'
              stroke={colors.primary}
              strokeWidth={3}
              strokeLinecap='round'
            />
          </Svg>
        </Animated.View>
      </View>
      <AppText style={styles.label}>{label}</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 16, padding: 24 },
  illustration: { width: 120, height: 120 },
  label: { textAlign: 'center', fontWeight: '600' },
})
