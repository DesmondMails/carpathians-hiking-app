import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText, Slider } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'

import { MIN_NEAR_DISTANCE_KM, MAX_NEAR_DISTANCE_KM } from '../../../constants'
import { filterStyles } from '../styles'

type NearDistanceProps = {
  value?: number
  onChange: (value: number) => void
  enabled: boolean
}

export const NearDistance: FC<NearDistanceProps> = ({
  value,
  onChange,
  enabled,
}) => (
  <View style={filterStyles.section}>
    <View style={filterStyles.row}>
      <AppText variant='button'>Поруч зі мною</AppText>
    </View>
    <View style={filterStyles.row}>
      <AppText variant='caption' color={colors.textSecondary}>
        До старту маршруту
      </AppText>
      <AppText variant='bodyMedium'>
        {enabled ? `До ${value} км` : 'Будь-де'}
      </AppText>
    </View>
    <View style={[filterStyles.sliderGroup, !enabled && styles.disabled]}>
      <Slider
        value={value}
        minimumValue={MIN_NEAR_DISTANCE_KM}
        maximumValue={MAX_NEAR_DISTANCE_KM}
        enabled={enabled}
        onValueChange={onChange}
      />
      <View style={filterStyles.row}>
        <AppText variant='caption' color={colors.textSecondary}>
          {MIN_NEAR_DISTANCE_KM} км
        </AppText>
        <AppText variant='caption' color={colors.textSecondary}>
          {MAX_NEAR_DISTANCE_KM} км
        </AppText>
      </View>
    </View>
    <View style={styles.description}>
      <Feather name='crosshair' size={14} color={colors.textSecondary} />
      <AppText
        variant='caption'
        color={colors.textSecondary}
        style={styles.hint}
      >
        Радіус по прямій, не шлях автомобілем
      </AppText>
    </View>
  </View>
)

const styles = StyleSheet.create({
  description: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hint: { flex: 1 },
  disabled: { opacity: 0.45 },
})
