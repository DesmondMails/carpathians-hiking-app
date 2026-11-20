import { FC, ReactNode } from 'react'

import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'

import { AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { OnboardingFooter } from './OnboardingFooter'

interface OnboardingStepProps {
  heading: ReactNode
  description: string
  children?: ReactNode
  contentStyle?: StyleProp<ViewStyle>
  descriptionStyle?: StyleProp<TextStyle>
  footerHint?: string
  isNextDisabled?: boolean
  nextAccessibilityLabel?: string
  onNext: () => void
}

export const OnboardingStep: FC<OnboardingStepProps> = ({
  heading,
  description,
  children,
  contentStyle,
  descriptionStyle,
  footerHint,
  isNextDisabled,
  nextAccessibilityLabel,
  onNext,
}) => (
  <View style={styles.container}>
    <View style={[styles.content, contentStyle]}>
      <AppText variant='h2' style={styles.heading}>
        {heading}
      </AppText>

      <AppText
        variant='bodyMedium'
        color={colors.textSecondary}
        style={[styles.description, descriptionStyle]}
      >
        {description}
      </AppText>

      {/* Flexible slot: grows/shrinks to the space left in the fixed-height card */}
      {children ? <View style={styles.slot}>{children}</View> : null}
    </View>

    <OnboardingFooter
      title={footerHint}
      isBtnDisabled={isNextDisabled}
      buttonAccessibilityLabel={nextAccessibilityLabel}
      onNextPress={onNext}
    />
  </View>
)

// flexGrow (not flex: 1): `flex: 1` sets flexBasis 0, which collapses to
// zero height when the card is content-sized (keyboard open).
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.md,
  },
  slot: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  heading: {
    marginTop: spacing.sm,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
})
