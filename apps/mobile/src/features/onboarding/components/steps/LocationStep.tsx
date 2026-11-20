import { StyleSheet } from 'react-native'

import { useUserLocation } from '@/src/shared/hooks'
import { spacing } from '@/src/theme/spacing'

import { LocationMapIllustration } from '../LocationMapIllustration'
import { OnboardingStep } from '../OnboardingStep'
import type { OnboardingStepComponentProps } from './types'

export const LocationStep = ({ onNext }: OnboardingStepComponentProps) => {
  const { requestPermission, isRequestingPermission } = useUserLocation({
    fetchOnMount: false,
  })

  const onNextPress = async () => {
    await requestPermission()
    onNext()
  }

  return (
    <OnboardingStep
      heading='Знаходьте маршрути поруч'
      description='Ми використовуємо локацію, щоб показати маршрути поблизу та відстань до їхнього старту.'
      descriptionStyle={styles.description}
      isNextDisabled={isRequestingPermission}
      nextAccessibilityLabel='Запросити доступ до локації'
      onNext={onNextPress}
    >
      <LocationMapIllustration />
    </OnboardingStep>
  )
}

const styles = StyleSheet.create({
  description: {
    marginTop: spacing.sm,
  },
})
