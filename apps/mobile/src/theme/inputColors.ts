import { colors } from './colors'

export const inputColors = {
  default: {
    border: colors.border,
    text: colors.textPrimary,
    placeholder: colors.textDisabled,
    helper: colors.textSecondary,
    background: colors.white,
  },
  success: {
    border: colors.primary,
    text: colors.textPrimary,
    placeholder: colors.textDisabled,
    helper: colors.success,
    background: colors.white,
  },
  error: {
    border: colors.warning,
    text: colors.textPrimary,
    placeholder: colors.textDisabled,
    helper: colors.warning,
    background: colors.white,
  },
  focused: {
    border: colors.primary,
  },
} as const
