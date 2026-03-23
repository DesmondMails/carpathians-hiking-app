import { colors } from './colors'

export const buttonColors = {
  primary: {
    background: colors.primary,
    text: colors.white,
    border: colors.primary,
  },
  warning: {
    background: colors.warning,
    text: colors.white,
    border: colors.warning,
  },
  success: {
    background: colors.success,
    text: colors.white,
    border: colors.success,
  },
  disabled: {
    background: colors.gray300,
    text: colors.textDisabled,
    border: colors.gray300,
  },
  outline: {
    background: 'transparent',
    text: colors.primary,
    border: colors.primary,
  },
} as const
