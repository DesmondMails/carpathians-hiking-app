import { FC } from 'react'

import { View } from 'react-native'

import { AppText, RangeSlider } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'

import { MAX_DISTANCE_KM, MIN_DISTANCE_KM } from '../../../constants'
import { FilterTitleComponent } from '../FilterTitleComponent'
import { filterStyles } from '../styles'

type DistanceWrapperProps = {
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export const DistanceWrapper: FC<DistanceWrapperProps> = ({
  value,
  onChange,
}) => {
  const rightText = () => {
    const leftNumberFormatted = value[0].toFixed(1).replace('.', ',')
    const rightNumberFormatted = value[1].toFixed(1).replace('.', ',')

    const isPlusSign = +value[1].toFixed(0) >= MAX_DISTANCE_KM

    return `${leftNumberFormatted}–${rightNumberFormatted} км${isPlusSign ? '+' : ''}`
  }

  return (
    <View style={filterStyles.section}>
      <FilterTitleComponent
        leftText='Довжина маршруту'
        rightText={rightText()}
      />
      <View style={filterStyles.sliderGroup}>
        <RangeSlider
          range={value}
          minimumValue={MIN_DISTANCE_KM}
          maximumValue={MAX_DISTANCE_KM}
          step={0.1}
          minimumRange={0.1}
          onValueChange={onChange}
        />
        <View style={filterStyles.row}>
          <AppText variant='caption' color={colors.textSecondary}>
            {MIN_DISTANCE_KM} км
          </AppText>
          <AppText variant='caption' color={colors.textSecondary}>
            {MAX_DISTANCE_KM} км
          </AppText>
        </View>
      </View>
    </View>
  )
}
