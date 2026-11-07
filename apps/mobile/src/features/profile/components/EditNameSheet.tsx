import { useEffect, useMemo, useRef, useState } from 'react'

import { Keyboard, StyleSheet, useWindowDimensions, View } from 'react-native'

import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAuthStore } from '@/src/features/auth/store/auth.store'
import { AppButton, AppInput, BottomSheet } from '@/src/shared/components'
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage'
import { spacing } from '@/src/theme/spacing'

type EditNameSheetProps = {
  currentName: string
  onClose: () => void
}

export const EditNameSheet = ({ currentName, onClose }: EditNameSheetProps) => {
  const sheetRef = useRef<BottomSheetModal>(null)
  const submittingRef = useRef(false)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const [name, setName] = useState(currentName)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>()
  const [isTouched, setIsTouched] = useState(false)
  const insets = useSafeAreaInsets()
  const { height, fontScale } = useWindowDimensions()

  const snapPoints = useMemo(
    () => [Math.min(320 * Math.max(fontScale, 1) + insets.bottom, height - insets.top)],
    [fontScale, height, insets.bottom, insets.top]
  )

  const trimmedName = name.trim()
  const nameLength = Array.from(trimmedName).length
  const validationError =
    nameLength < 2
      ? 'Ім’я має містити щонайменше 2 символи'
      : nameLength > 12
        ? 'Ім’я має містити не більше 12 символів'
        : undefined
  const canSave = !validationError && trimmedName !== currentName.trim()
  const error = submitError ?? (isTouched ? validationError : undefined)

  useEffect(() => {
    sheetRef.current?.present()
  }, [])

  const handleSave = async () => {
    if (!canSave || submittingRef.current) return

    submittingRef.current = true
    setIsSubmitting(true)
    setSubmitError(undefined)

    try {
      await updateProfile({ name: trimmedName })
      Keyboard.dismiss()
      sheetRef.current?.dismiss()
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
    <BottomSheet
      ref={sheetRef}
      title='Редагувати ім’я'
      closeAccessibilityLabel='Закрити редагування імені'
      snapPoints={snapPoints}
      dismissible={!isSubmitting}
      enableContentPanningGesture={false}
      androidKeyboardInputMode='adjustResize'
      onDismiss={() => {
        Keyboard.dismiss()
        onClose()
      }}
      footer={
        <View style={styles.footer}>
          <AppButton
            title='Зберегти'
            onPress={handleSave}
            loading={isSubmitting}
            disabled={!canSave}
          />
        </View>
      }
    >
      <View style={styles.form}>
        <AppInput
          bottomSheet
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
          onSubmitEditing={handleSave}
          status={error ? 'error' : 'default'}
          helperText={error ?? 'Від 2 до 12 символів'}
        />
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  form: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
})
