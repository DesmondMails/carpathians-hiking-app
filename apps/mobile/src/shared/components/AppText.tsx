import React from 'react'
import { Text, TextProps, StyleProp, TextStyle, StyleSheet } from 'react-native'

import { colors } from '@/src/theme/colors'
import { typography, TypographyVariant } from '@/src/theme/typography'

type AppTextProps = TextProps & {
  variant?: TypographyVariant
  color?: string
  style?: StyleProp<TextStyle>
}

export function AppText({
  variant = 'body',
  color = colors.textPrimary,
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[styles.base, typography[variant], { color }, style]}
    >
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
})
