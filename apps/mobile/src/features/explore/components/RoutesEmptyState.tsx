import { StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'

export function RoutesEmptyState() {
  return (
    <View style={styles.container}>
      <View
        style={styles.icon}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Feather name="map" size={24} color={colors.primary} />
      </View>
      <AppText variant="bodyMedium" style={styles.title}>
        Маршрутів не знайдено
      </AppText>
      <AppText color={colors.textSecondary} style={styles.description}>
        Спробуй змінити фільтри або збільшити радіус пошуку.
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { textAlign: 'center', marginBottom: 8 },
  description: { maxWidth: 280, textAlign: 'center' },
})
