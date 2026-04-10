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
import type { TransportOption } from './types'

interface TransportOptionCardProps {
  option: TransportOption
}

export const TransportOptionCard: FC<TransportOptionCardProps> = ({
  option,
}) => {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handleAction = () => {
    console.log('Transport action:', option.id, option.actionLabel)
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
          <TransportIcon type={option.type} />
          <View style={styles.body}>
            <AppText style={styles.title}>{option.title}</AppText>
            <AppText style={styles.subtitle}>{option.subtitle}</AppText>

            <View style={styles.steps}>
              {option.steps.map((step, index) => (
                <View key={`${option.id}-step-${index}`}>
                  {index > 0 && <View style={styles.stepDivider} />}
                  <AppText style={styles.stepText}>{step}</AppText>
                </View>
              ))}
            </View>

            {option.actionLabel ? (
              <Pressable
                onPress={handleAction}
                style={({ pressed }) => [
                  styles.actionBtn,
                  pressed && styles.actionBtnPressed,
                ]}
              >
                <AppText style={styles.actionLabel}>
                  {option.actionLabel}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 14,
    paddingBottom: spacing.md,
  },
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
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  steps: {
    marginTop: spacing.sm,
    gap: 0,
  },
  stepDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray200,
    marginVertical: spacing.sm,
  },
  stepText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
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
