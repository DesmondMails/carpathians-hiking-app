import { useRef, useState } from 'react'

import { useAuthStore } from '@/src/features/auth/store/auth.store'

import { OnboardingStep } from '../OnboardingStep'
import { WelcomeIllustration } from '../WelcomeIllustration'
import type { OnboardingStepComponentProps } from './types'

export const WelcomeStep = ({ onNext }: OnboardingStepComponentProps) => {
  const submittingRef = useRef(false)
  const [isLoading, setIsloading] = useState(false)

  const completeOnboarding = useAuthStore((state) => state.completeOnboarding)

  const name = useAuthStore((state) => state.user?.name) ?? 'мандрівнику'

  const onNextPress = async () => {
    if (submittingRef.current || isLoading) return

    submittingRef.current = true
    setIsloading(true)

    try {
      // On success the (app) layout guard flips and navigates to (tabs)
      await completeOnboarding()

      onNext()
    } catch {
      // Toast is shown by the store; finally unlocks the button for a retry
    } finally {
      submittingRef.current = false
      setIsloading(false)
    }
  }

  return (
    <OnboardingStep
      heading={`Раді вітати, ${name}!`}
      description='Ваш профіль готовий. Знаходьте маршрути, відкривайте Карпати й плануйте наступну пригоду.'
      isNextDisabled={isLoading}
      nextAccessibilityLabel='Завершити знайомство з додатком'
      onNext={onNextPress}
    >
      <WelcomeIllustration />
    </OnboardingStep>
  )
}
