import React, { useEffect } from 'react'

import { StyleSheet, ImageBackground } from 'react-native'

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated'

type AnimatedSplashProps = {
  onFinish: () => void
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(1)

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 350,
      easing: Easing.out(Easing.ease),
    })

    opacity.value = withDelay(
      900,
      withTiming(
        0,
        {
          duration: 450,
          easing: Easing.inOut(Easing.ease),
        },
        (finished) => {
          if (finished) {
            runOnJS(onFinish)()
          }
        },
      ),
    )

    scale.value = withDelay(
      900,
      withTiming(1.04, {
        duration: 450,
        easing: Easing.inOut(Easing.ease),
      }),
    )
  }, [onFinish, opacity, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      <ImageBackground
        source={require('@/assets/images/splash-screen-final.png')}
        resizeMode='cover'
        style={styles.background}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#043521',
  },
})
