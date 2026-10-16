import { FC } from 'react'

import { View } from 'react-native'

import { ButtonChip } from '@/src/shared/components'

import { RATING_OPTIONS } from '../../../constants'
import { FilterTitleComponent } from '../FilterTitleComponent'
import { filterStyles } from '../styles'

type RatingFilterProps = {
  value: number | null
  onChange: (value: number | null) => void
}

export const RatingFilter: FC<RatingFilterProps> = ({ value, onChange }) => (
  <View style={filterStyles.section}>
    <FilterTitleComponent leftText='Мінімальний рейтинг' />
    <View style={filterStyles.chips}>
      {RATING_OPTIONS.map((option) => (
        <ButtonChip
          key={option.value}
          label={option.label}
          isActive={value === option.value}
          handlePress={() => onChange(option.value)}
        />
      ))}
    </View>
  </View>
)
