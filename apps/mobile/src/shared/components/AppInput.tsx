import React, { useMemo, useState } from 'react'

import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  TextInputProps,
} from 'react-native'

import { colors } from '@/src/theme/colors'
import { inputRadius, inputSizes } from '@/src/theme/input'
import { inputColors } from '@/src/theme/inputColors'
import { spacing } from '@/src/theme/spacing'
import { typography } from '@/src/theme/typography'

import { AppText } from './AppText'

type AppInputStatus = 'default' | 'success' | 'error'

type AppInputProps = TextInputProps & {
  label?: string
  helperText?: string
  status?: AppInputStatus
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconPress?: () => void
}

export function AppInput({
  label,
  helperText,
  status = 'default',
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  onFocus,
  onBlur,
  ...props
}: AppInputProps) {
  const [focused, setFocused] = useState(false)

  const palette = useMemo(() => {
    const base = inputColors[status]
    return {
      ...base,
      border: focused ? inputColors.focused.border : base.border,
    }
  }, [status, focused])

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

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: palette.border,
            backgroundColor: palette.background,
          },
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

        <TextInput
          placeholderTextColor={palette.placeholder}
          style={[styles.input, { color: palette.text }, style]}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          {...props}
        />

        {rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </Pressable>
        ) : null}
      </View>

      {helperText ? (
        <AppText variant='caption' color={palette.helper} style={styles.helper}>
          {helperText}
        </AppText>
      ) : null}
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
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
  },
  leftIcon: {
    marginRight: spacing.md,
  },
  rightIcon: {
    marginLeft: spacing.md,
  },
  helper: {
    marginTop: 0,
  },
})
