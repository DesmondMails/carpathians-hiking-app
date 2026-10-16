import { StyleSheet, View } from 'react-native'

import { RangeSlider as BaseRangeSlider } from '@react-native-assets/slider'

import { colors } from '@/src/theme/colors'

type RangeSliderProps = {
  range: [number, number]
  minimumValue: number
  maximumValue: number
  step?: number
  minimumRange?: number
  enabled?: boolean
  onValueChange: (range: [number, number]) => void
  onSlidingStart?: (range: [number, number]) => void
  onSlidingComplete?: (range: [number, number]) => void
}

export const RangeSlider = ({
  range,
  minimumValue,
  maximumValue,
  step = 1,
  minimumRange = step,
  enabled = true,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
}: RangeSliderProps) => (
  <View style={styles.container}>
    <BaseRangeSlider
      range={range}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      minimumRange={minimumRange}
      crossingAllowed={false}
      enabled={enabled}
      onValueChange={onValueChange}
      onSlidingStart={onSlidingStart}
      onSlidingComplete={onSlidingComplete}
      outboundColor={colors.gray200}
      inboundColor={colors.primary}
      thumbTintColor={colors.white}
      thumbSize={22}
      thumbStyle={styles.thumb}
      trackHeight={4}
      trackStyle={styles.track}
      style={styles.slider}
    />
  </View>
)

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 11,
  },
  slider: {
    height: 44,
    width: '100%',
  },
  thumb: {
    borderWidth: 3,
    borderColor: colors.primary,
    elevation: 0,
  },
  track: {
    borderRadius: 2,
  },
})
