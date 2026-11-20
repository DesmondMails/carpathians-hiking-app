import { useRef, useState } from 'react'

import { Keyboard, StyleSheet } from 'react-native'

import { useAuthStore } from '@/src/features/auth/store/auth.store'
import { AppInput } from '@/src/shared/components'
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage'
import { spacing } from '@/src/theme/spacing'

import { OnboardingStep } from '../OnboardingStep'
import type { OnboardingStepComponentProps } from './types'

export const NameStep = ({ onNext }: OnboardingStepComponentProps) => {
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const savedName = useAuthStore((state) => state.user?.name)

  const submittingRef = useRef(false)
  // Prefill when the user comes back to this step
  const [name, setName] = useState(savedName ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>()
  const [isTouched, setIsTouched] = useState(false)

  const trimmedName = name.trim()
  const nameLength = Array.from(trimmedName).length
  const validationError =
    nameLength < 2
      ? 'Ім’я має містити щонайменше 2 символи'
      : nameLength > 12
        ? 'Ім’я має містити не більше 12 символів'
        : undefined

  const error = submitError ?? (isTouched ? validationError : undefined)

  const isNextDisabled = Boolean(isSubmitting || error || validationError)

  const onNextPress = async () => {
    if (submittingRef.current || isSubmitting) return

    if (validationError) {
      setIsTouched(true)
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)
    setSubmitError(undefined)

    try {
      if (trimmedName !== savedName) {
        await updateProfile({ name: trimmedName })
      }

      Keyboard.dismiss()
      onNext()
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, 'Не вдалося зберегти ім’я. Спробуйте ще раз.')
      )
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <OnboardingStep
      heading='Як вас звати?'
      description='Це ім’я відображатиметься у вашому профілі та на маршрутах.'
      descriptionStyle={styles.description}
      footerHint="Ім'я обов'язкове"
      isNextDisabled={isNextDisabled}
      onNext={onNextPress}
    >
      <AppInput
        autoFocus
        label='Ім’я'
        accessibilityLabel='Ім’я'
        placeholder='Введіть ім’я'
        value={name}
        onChangeText={(value) => {
          setName(value)
          setIsTouched(true)
          setSubmitError(undefined)
        }}
        onBlur={() => setIsTouched(true)}
        editable={!isSubmitting}
        autoCapitalize='words'
        autoCorrect={false}
        textContentType='givenName'
        autoComplete='given-name'
        returnKeyType='done'
        submitBehavior='submit'
        onSubmitEditing={onNextPress}
        status={error ? 'error' : 'default'}
        helperText={error ?? 'Від 2 до 12 символів'}
      />
    </OnboardingStep>
  )
}

const styles = StyleSheet.create({
  description: {
    marginBottom: spacing.sm,
  },
})
