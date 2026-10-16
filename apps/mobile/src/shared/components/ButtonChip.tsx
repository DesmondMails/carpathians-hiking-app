import { FC } from 'react'

import { Pressable, StyleSheet } from 'react-native'

import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { AppText } from './AppText'

type ButtonChipProps = {
  label: string
  isActive: boolean
  handlePress: () => void
}

export const ButtonChip: FC<ButtonChipProps> = ({
  label,
  isActive,
  handlePress,
}) => {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ selected: isActive }}
      onPress={handlePress}
      style={[styles.chip, isActive && styles.chipActive]}
    >
      <AppText
        variant='bodyMedium'
        color={isActive ? colors.white : colors.textPrimary}
      >
        {label}
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
})
