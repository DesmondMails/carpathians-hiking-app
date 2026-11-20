import { FC, useEffect } from 'react'

import { StyleSheet, View } from 'react-native'

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

interface ProgressBarProps {
  /** 0–100 */
  percentage: number
  duration?: number
}

const clamp = (value: number) => Math.min(Math.max(value, 0), 100)

export const ProgressBar: FC<ProgressBarProps> = ({
  percentage,
  duration = 400,
}) => {
  const target = clamp(percentage)
  const progress = useSharedValue(target)

  useEffect(() => {
    progress.set(
      withTiming(target, { duration, easing: Easing.out(Easing.cubic) })
    )
  }, [target, duration, progress])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.get()}%`,
  }))

  return (
    <View
      style={styles.progressWrapper}
      accessibilityRole='progressbar'
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target) }}
    >
      <Animated.View style={[styles.progress, animatedStyle]} />
    </View>
  )
}

const styles = StyleSheet.create({
  progressWrapper: {
    height: 6,
    backgroundColor: colors.gray300,
    borderRadius: spacing.md,
    overflow: 'hidden',
  },
  progress: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: spacing.md,
  },
})
