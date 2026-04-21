import { FC } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { Difficulty, DIFFICULTY_VALUES } from '@hiking/shared'

import { AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

interface DifficultySelectorProps {
  value?: Difficulty
  onChange: (value: Difficulty | undefined) => void
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: 'Легкий',
  MODERATE: 'Середній',
  HARD: 'Складний',
  EXTREME: 'Екстремальний',
}

export const DifficultySelector: FC<DifficultySelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      {DIFFICULTY_VALUES.map((item) => {
        const isActive = value === item

        const handlePress = () => {
          onChange(isActive ? undefined : item)
        }

        return (
          <Pressable
            key={item}
            onPress={handlePress}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <AppText
              variant='bodyMedium'
              color={isActive ? colors.white : colors.textPrimary}
            >
              {DIFFICULTY_LABELS[item]}
            </AppText>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
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
