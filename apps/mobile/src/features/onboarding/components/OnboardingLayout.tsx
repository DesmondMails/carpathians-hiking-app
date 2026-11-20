import { FC, ReactNode } from 'react'

import { StyleSheet, useWindowDimensions, View } from 'react-native'

import { HeroCardLayout } from '@/src/shared/components'
import { useKeyboardVisible } from '@/src/shared/hooks'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { OnboardingHeader } from './OnboardingHeader'
import { getCardHeight } from '../utils/getCardHeight'

interface OnboardingLayoutProps {
  /** 1-based */
  step: number
  totalSteps: number
  title: string
  children: ReactNode
}

export const OnboardingLayout: FC<OnboardingLayoutProps> = ({
  step,
  totalSteps,
  title,
  children,
}) => {
  const { height: windowHeight } = useWindowDimensions()
  const isKeyboardVisible = useKeyboardVisible()

  const cardHeightStyle = isKeyboardVisible
    ? undefined
    : { height: getCardHeight(windowHeight) }

  return (
    <HeroCardLayout title='' cardStyle={[styles.card, cardHeightStyle]}>
      <View style={styles.header}>
        <OnboardingHeader title={title} step={step} totalSteps={totalSteps} />
      </View>

      <View style={styles.body}>{children}</View>
    </HeroCardLayout>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryLight,
  },
  header: {
    marginBottom: spacing.md,
  },
  body: {
    flexGrow: 1,
  },
})
