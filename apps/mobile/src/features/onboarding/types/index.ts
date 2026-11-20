import { ComponentType } from 'react'

import { OnboardingStepComponentProps } from '../components'

export interface OnboardingStepConfig {
  key: string
  title: string
  Component: ComponentType<OnboardingStepComponentProps>
}
