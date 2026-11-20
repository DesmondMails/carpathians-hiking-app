import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { AppText, ProgressBar } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'
import { fontFamily } from '@/src/theme/typography'

interface OnboardingHeaderProps {
  /** 1-based */
  step: number
  totalSteps: number
  title: string
}

export const OnboardingHeader: FC<OnboardingHeaderProps> = ({
  title,
  step,
  totalSteps,
}) => {
  const percentage = (step / totalSteps) * 100

  return (
    <View style={styles.onboardingHeader}>
      <View style={styles.onboardingTitle}>
        <AppText
          variant='caption'
          color={colors.primaryDark}
          style={styles.sectionTitle}
        >
          {title.toLocaleUpperCase('uk-UA')}
        </AppText>

        <AppText
          variant='caption'
          color={colors.primaryDark}
          style={styles.stepTitle}
        >
          КРОК {step} ІЗ {totalSteps}
        </AppText>
      </View>

      <ProgressBar percentage={percentage} />
    </View>
  )
}

const styles = StyleSheet.create({
  onboardingHeader: {
    gap: spacing.md,
  },
  onboardingTitle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: fontFamily.bodySemiBold,
    letterSpacing: 1.2,
  },
  stepTitle: {
    fontFamily: fontFamily.bodySemiBold,
    letterSpacing: 1,
  },
})
