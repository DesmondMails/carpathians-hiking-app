import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppButton } from '@/src/shared/components/AppButton'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'

type RoutesListFooterProps = {
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export function RoutesListFooter({
  isLoading,
  error,
  onRetry,
}: RoutesListFooterProps) {
  if (isLoading) {
    return (
      <View style={styles.loading} accessibilityLiveRegion="polite">
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText color={colors.textSecondary}>Завантажуємо маршрути…</AppText>
      </View>
    )
  }

  if (!error) return null

  return (
    <View style={styles.error}>
      <View
        style={styles.icon}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Feather name="alert-circle" size={22} color={colors.textSecondary} />
      </View>
      <AppText
        color={colors.textSecondary}
        style={styles.message}
        accessibilityLiveRegion="polite"
      >
        {error}
      </AppText>
      <AppButton
        title="Спробувати ще раз"
        variant="outline"
        size="medium"
        fullWidth={false}
        onPress={onRetry}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  error: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    gap: 16,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: { maxWidth: 280, textAlign: 'center' },
})
