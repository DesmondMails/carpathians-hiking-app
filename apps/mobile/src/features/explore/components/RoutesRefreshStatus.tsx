import { StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppButton } from '@/src/shared/components/AppButton'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'

// The in-progress state is shown by the spinner in AppSearch
type RoutesRefreshStatusProps = {
  hasError: boolean
  onRetry: () => void
}

export function RoutesRefreshStatus({
  hasError,
  onRetry,
}: RoutesRefreshStatusProps) {
  if (!hasError) return null

  return (
    <View style={styles.row}>
      <Feather name="alert-circle" size={16} color={colors.textSecondary} />
      <AppText
        variant="caption"
        color={colors.textSecondary}
        style={styles.message}
        accessibilityLiveRegion="polite"
      >
        Не вдалося оновити результати
      </AppText>
      <AppButton
        title="Повторити"
        variant="outline"
        size="small"
        fullWidth={false}
        onPress={onRetry}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    minHeight: 40,
  },
  message: { flex: 1 },
})
