import React, { useImperativeHandle, useMemo, useRef, useState } from 'react'

import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  TextInputProps,
} from 'react-native'

import { BottomSheetTextInput } from '@gorhom/bottom-sheet'

import { colors } from '@/src/theme/colors'
import { inputRadius, inputSizes } from '@/src/theme/input'
import { inputColors } from '@/src/theme/inputColors'
import { spacing } from '@/src/theme/spacing'
import { typography } from '@/src/theme/typography'

import { AppText } from './AppText'

type AppInputStatus = 'default' | 'success' | 'error'

export type AppInputHandle = Pick<TextInput, 'focus'>

type AppInputProps = TextInputProps & {
  ref?: React.Ref<AppInputHandle>
  label?: string
  helperText?: string
  status?: AppInputStatus
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconPress?: () => void
  bottomSheet?: boolean
}

export function AppInput({
  ref,
  label,
  helperText,
  status = 'default',
  leftIcon,
  rightIcon,
  onRightIconPress,
  bottomSheet = false,
  style,
  onFocus,
  onBlur,
  ...props
}: AppInputProps) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<TextInput | null>(null)
  const Input = bottomSheet ? BottomSheetTextInput : TextInput

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }), [])

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

        <Input
          ref={(input) => {
            inputRef.current = input ?? null
          }}
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
