import { FC } from 'react'

import { View } from 'react-native'

import { Difficulty } from '@hiking/shared'

import { ButtonChip } from '@/src/shared/components'

import { FilterTitleComponent } from '../FilterTitleComponent'
import { filterStyles } from '../styles'

const OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'EASY', label: 'Легкий' },
  { value: 'MODERATE', label: 'Середній' },
  { value: 'HARD', label: 'Складний' },
  { value: 'EXTREME', label: 'Екстремальний' },
]

type DifficultyFilterProps = {
  value?: Difficulty[]
  onChange: (value: Difficulty[]) => void
}

export const DifficultyFilter: FC<DifficultyFilterProps> = ({
  value,
  onChange,
}) => {
  const handleDifficultyChange = (selectedValue: Difficulty) => {
    const selectedValues = value?.includes(selectedValue)
      ? value.filter((item) => item !== selectedValue)
      : [...(value ?? []), selectedValue]

    onChange(selectedValues)
  }

  return (
    <View style={filterStyles.section}>
      <FilterTitleComponent leftText='Складність' rightText='Можна декілька' />
      <View style={filterStyles.chips}>
        {OPTIONS.map((option) => (
          <ButtonChip
            key={option.value}
            label={option.label}
            isActive={!!value?.includes(option.value)}
            handlePress={() => handleDifficultyChange(option.value)}
          />
        ))}
      </View>
    </View>
  )
}
