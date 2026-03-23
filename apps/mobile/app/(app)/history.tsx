import { StyleSheet, View } from 'react-native'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <AppText variant='title'>History</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
