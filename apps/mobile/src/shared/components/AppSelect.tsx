import React, { useMemo, useState } from 'react'

import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { colors } from '@/src/theme/colors'
import { inputRadius, inputSizes } from '@/src/theme/input'
import { inputColors } from '@/src/theme/inputColors'
import { spacing } from '@/src/theme/spacing'
import { typography } from '@/src/theme/typography'

import { AppText } from './AppText'

export type AppSelectStatus = 'default' | 'success' | 'error'

export type SelectOption<T extends string = string> = {
  label: string
  value: T
  description?: string
}

type AppSelectProps<T extends string = string> = {
  label?: string
  helperText?: string
  status?: AppSelectStatus
  placeholder?: string
  value?: T
  options: SelectOption<T>[]
  onChange: (value: T | undefined) => void
  modalTitle?: string
  disabled?: boolean
  allowClear?: boolean
  emptyStateText?: string
}

export function AppSelect<T extends string = string>({
  label,
  helperText,
  status = 'default',
  placeholder = 'Оберіть значення',
  value,
  options,
  onChange,
  modalTitle,
  disabled = false,
  allowClear = false,
  emptyStateText = 'Немає доступних опцій',
}: AppSelectProps<T>) {
  const [open, setOpen] = useState(false)

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  const palette = useMemo(() => {
    const base = inputColors[status]
    return {
      ...base,
      border: open ? inputColors.focused.border : base.border,
    }
  }, [status, open])

  const handleClose = () => {
    setOpen(false)
  }

  const handleSelect = (nextValue: T) => {
    onChange(nextValue)
    handleClose()
  }

  const handleClear = () => {
    onChange(undefined)
    handleClose()
  }

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText
          variant='bodyMedium'
          color={colors.textPrimary}
          style={styles.label}
        >
          {label}
        </AppText>
      ) : null}

      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        style={[
          styles.inputContainer,
          {
            borderColor: palette.border,
            backgroundColor: palette.background,
          },
          disabled && styles.disabled,
        ]}
      >
        <AppText
          style={[
            styles.valueText,
            {
              color: selectedOption ? palette.text : palette.placeholder,
            },
          ]}
        >
          {selectedOption?.label ?? placeholder}
        </AppText>

        <Feather name='chevron-down' size={18} color={palette.placeholder} />
      </Pressable>

      {helperText ? (
        <AppText variant='caption' color={palette.helper} style={styles.helper}>
          {helperText}
        </AppText>
      ) : null}

      <Modal
        transparent
        visible={open}
        animationType='fade'
        onRequestClose={handleClose}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={handleClose} />

          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <AppText variant='title' color={colors.textPrimary}>
                {modalTitle ?? label ?? 'Оберіть значення'}
              </AppText>

              <Pressable onPress={handleClose} style={styles.iconButton}>
                <Feather name='x' size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            {allowClear && selectedOption ? (
              <Pressable onPress={handleClear} style={styles.clearButton}>
                <AppText variant='bodyMedium' color={colors.primary}>
                  Очистити вибір
                </AppText>
              </Pressable>
            ) : null}

            <ScrollView
              style={styles.optionsList}
              contentContainerStyle={styles.optionsContent}
              showsVerticalScrollIndicator={false}
            >
              {options.length === 0 ? (
                <AppText variant='body' color={colors.textSecondary}>
                  {emptyStateText}
                </AppText>
              ) : (
                options.map((option) => {
                  const isSelected = option.value === value

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionRowSelected,
                      ]}
                    >
                      <View style={styles.optionCopy}>
                        <AppText
                          variant='bodyMedium'
                          color={colors.textPrimary}
                        >
                          {option.label}
                        </AppText>

                        {option.description ? (
                          <AppText
                            variant='caption'
                            color={colors.textSecondary}
                          >
                            {option.description}
                          </AppText>
                        ) : null}
                      </View>

                      {isSelected ? (
                        <Feather
                          name='check'
                          size={18}
                          color={colors.primary}
                        />
                      ) : null}
                    </Pressable>
                  )
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    marginBottom: 0,
  },
  inputContainer: {
    minHeight: inputSizes.md,
    borderWidth: 1,
    borderRadius: inputRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  valueText: {
    flex: 1,
    ...typography.body,
  },
  helper: {
    marginTop: 0,
  },
  disabled: {
    opacity: 0.6,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.transparentDark,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    maxHeight: '75%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  clearButton: {
    alignSelf: 'flex-start',
  },
  optionsList: {
    flexGrow: 0,
  },
  optionsContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  optionRow: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
})
