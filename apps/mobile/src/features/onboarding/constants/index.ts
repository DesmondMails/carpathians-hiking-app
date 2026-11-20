import { LocationStep, NameStep, WelcomeStep } from '../components'
import { OnboardingStepConfig } from '../types'

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  { key: 'name', title: 'Ваш профіль', Component: NameStep },
  { key: 'location', title: 'Ваші мандрівки', Component: LocationStep },
  { key: 'welcome', title: 'Ваші мандрівки', Component: WelcomeStep },
]
export * from './layout'
