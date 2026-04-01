import { FC } from 'react'
import { StyleSheet, View } from 'react-native'

interface BottomGradientProps {
  height?: number
}

export const BottomGradient: FC<BottomGradientProps> = ({ height = 120 }) => {
  const steps = [0.01, 0.05, 0.12, 0.21, 0.31, 0.42, 0.52, 0.6]

  return (
    <View
      style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]}
      pointerEvents='none'
    >
      {steps.map((opacity, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: height * (1 - i / steps.length),
            backgroundColor: `rgba(10,10,10,${opacity})`,
          }}
        />
      ))}
    </View>
  )
}
