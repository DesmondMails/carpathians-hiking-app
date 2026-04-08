import { FC } from 'react'

import { Pressable, ScrollView, StyleSheet } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

import { Category } from '../types'


interface CategoryChipsProps {
  categories: Category[]
  active: string
  onPress: (label: string) => void
}

export const CategoryChips: FC<CategoryChipsProps> = ({
  categories,
  active,
  onPress,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={cc.row}
    >
      {categories.map((cat) => {
        const isActive = cat.label === active
        return (
          <Pressable
            key={cat.label}
            style={[cc.chip, isActive && cc.chipActive]}
            onPress={() => onPress(cat.label)}
          >
            <Feather
              name={cat.icon as any}
              size={13}
              color={isActive ? colors.white : colors.textSecondary}
            />
            <AppText style={[cc.label, isActive && cc.labelActive]}>
              {cat.label}
            </AppText>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const cc = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 200,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gray200,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
  },
  labelActive: { color: colors.white },
})
