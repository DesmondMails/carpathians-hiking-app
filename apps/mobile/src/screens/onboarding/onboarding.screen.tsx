import { useEffect, useState } from 'react'

import { BackHandler } from 'react-native'

import { OnboardingLayout } from '@/src/features/onboarding/components'
import { ONBOARDING_STEPS } from '@/src/features/onboarding/constants'

export default function OnboardingScreen() {
  const [stepIndex, setStepIndex] = useState(0)

  const { key, title, Component } = ONBOARDING_STEPS[stepIndex]
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1

  const goNext = () => {
    if (isLastStep) {
      return
    }

    setStepIndex((index) => index + 1)
  }

  useEffect(() => {
    if (stepIndex === 0) return

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setStepIndex((index) => Math.max(index - 1, 0))
        return true
      }
    )

    return () => subscription.remove()
  }, [stepIndex])

  return (
    <OnboardingLayout
      step={stepIndex + 1}
      totalSteps={ONBOARDING_STEPS.length}
      title={title}
    >
      <Component key={key} onNext={goNext} />
    </OnboardingLayout>
  )
}
