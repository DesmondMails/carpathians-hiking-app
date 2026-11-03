import { FC } from 'react'

import { Pressable, ScrollView, StyleSheet } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components/AppText'
import { isSameValue } from '@/src/shared/utils/isSameValue'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

import { DEFAULT_FORM_VALUES, EXPLORE_CATEGORIES } from '../constants'
import { SearchFormValues } from '../schemas/search.schema'

interface CategoryChipsQuickSelectProps {
  appliedFilters: SearchFormValues
  handleApplyFilters: (filters: SearchFormValues) => void
}

const isCategoryActive = (
  filter: Partial<SearchFormValues>,
  applied: SearchFormValues
) =>
  (Object.keys(filter) as (keyof SearchFormValues)[]).every((key) =>
    isSameValue(filter[key], applied[key])
  )

export const CategoryChipsQuickSelect: FC<CategoryChipsQuickSelectProps> = ({
  appliedFilters,
  handleApplyFilters,
}) => {
  const handleQuickFilterSelected = (filter: Partial<SearchFormValues>) => {
    const isActiveFilterClicked = isCategoryActive(filter, appliedFilters)

    const filterToApply = isActiveFilterClicked
      ? DEFAULT_FORM_VALUES
      : { ...DEFAULT_FORM_VALUES, ...filter }

    handleApplyFilters(filterToApply)
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={cc.row}
    >
      {EXPLORE_CATEGORIES.map((cat) => {
        const isActive = isCategoryActive(cat.value, appliedFilters)

        return (
          <Pressable
            key={cat.label}
            style={[cc.chip, isActive && cc.chipActive]}
            onPress={() => handleQuickFilterSelected(cat.value)}
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
