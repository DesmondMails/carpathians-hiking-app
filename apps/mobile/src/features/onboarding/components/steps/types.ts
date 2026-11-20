export interface OnboardingStepComponentProps {
  /** Called by the step once its own work (validation, API call, permission) is done */
  onNext: () => void
}
