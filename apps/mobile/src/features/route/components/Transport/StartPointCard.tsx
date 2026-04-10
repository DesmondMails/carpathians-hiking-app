import { FC } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { AnimatedPressable } from '@/src/shared/components'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'
import { fontFamily, typography } from '@/src/theme/typography'

import { TransportIcon } from './TransportIcon'
import type { StartPoint } from './types'

interface StartPointCardProps {
  point: StartPoint
}

export const StartPointCard: FC<StartPointCardProps> = ({ point }) => {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const coords = `${point.lat.toFixed(3)}, ${point.lng.toFixed(3)}`

  const handleOpenMaps = () => {
    console.log('Open in Maps:', point.lat, point.lng)
  }

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 400 })
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 320 })
      }}
      style={animatedStyle}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <TransportIcon type='map' />
          <View style={styles.body}>
            <AppText style={styles.title}>Стартова точка</AppText>
            <AppText style={styles.coords}>{coords}</AppText>
            <Pressable
              onPress={handleOpenMaps}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && styles.actionBtnPressed,
              ]}
            >
              <AppText style={styles.actionLabel}>Відкрити в Maps</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  card: {},
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  coords: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  actionLabel: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.primaryDark,
  },
})
