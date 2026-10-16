import { FC, useState } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { Control, Controller } from 'react-hook-form'

import { AppText } from '@/src/shared/components'
import { AppSelect } from '@/src/shared/components/AppSelect'
import { colors } from '@/src/theme/colors'

import { DURATION_OPTIONS, ELEVATION_OPTIONS } from '../../../constants'
import { SearchFormValues } from '../../../schemas/search.schema'

type MoreFiltersProps = {
  control: Control<SearchFormValues>
}

export const MoreFilters: FC<MoreFiltersProps> = ({ control }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <View>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole='button'
        accessibilityState={{ expanded }}
      >
        <AppText variant='bodyMedium'>Ще фільтри</AppText>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textPrimary}
        />
      </Pressable>
      {expanded && (
        <View style={styles.fields}>
          <Controller
            name='maxElevationGainM'
            control={control}
            render={({ field: { onChange, value } }) => (
              <AppSelect
                label='Набір висоти'
                value={value}
                options={ELEVATION_OPTIONS}
                onChange={(value) => onChange(value ?? null)}
              />
            )}
          />

          <Controller
            name='maxDurationH'
            control={control}
            render={({ field: { onChange, value } }) => (
              <AppSelect
                label='Тривалість'
                value={value}
                options={DURATION_OPTIONS}
                onChange={(value) => onChange(value ?? null)}
              />
            )}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fields: { gap: 16, paddingBottom: 16 },
})
