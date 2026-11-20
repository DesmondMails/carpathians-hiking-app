import { Image, StyleSheet, View } from 'react-native'

const WELCOME_ILLUSTRATION = require('@/assets/illustrations/onboarding-welcome.png')

export const WelcomeIllustration = () => (
  <View
    accessible
    accessibilityLabel='Гірська стежка з позначкою завершеного маршруту'
    style={styles.container}
  >
    <Image
      source={WELCOME_ILLUSTRATION}
      resizeMode='contain'
      style={styles.image}
      accessible={false}
    />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // flex instead of intrinsic size: a local PNG otherwise takes its pixel
  // height (344pt) and `contain` leaves empty space above and below it
  image: {
    flex: 1,
    width: '100%',
  },
})
