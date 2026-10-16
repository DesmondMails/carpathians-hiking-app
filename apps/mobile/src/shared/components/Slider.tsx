import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Slider as BaseSlider } from '@react-native-assets/slider'

import { colors } from '@/src/theme/colors'

export type SliderProps = {
  value?: number
  minimumValue: number
  maximumValue: number
  step?: number
  enabled?: boolean
  onValueChange: (value: number) => void
}

export const Slider: FC<SliderProps> = ({
  value,
  minimumValue,
  maximumValue,
  step = 1,
  enabled = true,
  onValueChange,
}) => (
  <View style={styles.container}>
    <BaseSlider
      value={value}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      enabled={enabled}
      onValueChange={onValueChange}
      minimumTrackTintColor={colors.primary}
      maximumTrackTintColor={colors.gray200}
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
