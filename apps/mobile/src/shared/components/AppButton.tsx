import React from 'react'

import {
  Pressable,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'

import {
  buttonHeights,
  circleButtonSizes,
  buttonRadius,
  buttonTextBySize,
} from '@/src/theme/button'
import { buttonColors } from '@/src/theme/buttonColors'

import { AppText } from './AppText'

type ButtonSize = 'large' | 'medium' | 'small'
type ButtonVariant = 'primary' | 'warning' | 'success' | 'disabled' | 'outline'
type ButtonShape = 'pill' | 'circle'

type AppButtonProps = {
  title?: string
  icon?: React.ReactNode
  onPress?: () => void
  size?: ButtonSize
  variant?: ButtonVariant
  shape?: ButtonShape
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
}

export function AppButton({
  title,
  icon,
  onPress,
  size = 'large',
  variant = 'primary',
  shape = 'pill',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: AppButtonProps) {
  const resolvedVariant: ButtonVariant = disabled ? 'disabled' : variant
  const palette = buttonColors[resolvedVariant]

  const baseStyle: ViewStyle =
    shape === 'circle'
      ? {
          width: circleButtonSizes[size],
          height: circleButtonSizes[size],
          borderRadius: buttonRadius,
        }
      : {
          height: buttonHeights[size],
          borderRadius: buttonRadius,
          width: fullWidth ? '100%' : undefined,
          paddingHorizontal: 16,
        }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        baseStyle,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderWidth: resolvedVariant === 'outline' ? 1 : 0,
          opacity: pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <>
          {icon}
          {title ? (
            <AppText
              variant={buttonTextBySize[size]}
              color={palette.text}
              style={shape === 'circle' ? undefined : styles.text}
            >
              {title}
            </AppText>
          ) : null}
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    textAlign: 'center',
  },
})
