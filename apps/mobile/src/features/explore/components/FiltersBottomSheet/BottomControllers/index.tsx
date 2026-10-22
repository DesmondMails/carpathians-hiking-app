import { FC } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { AppButton, AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'

type BottomControllersProps = {
  isLoadingRoutes: boolean
  onReset: () => void
  onApply: () => void
}

export const BottomControllers: FC<BottomControllersProps> = ({
  isLoadingRoutes,
  onReset,
  onApply,
}) => (
  <View style={styles.container}>
    <Pressable
      disabled={isLoadingRoutes}
      onPress={onReset}
      style={[styles.reset, isLoadingRoutes && styles.disabled]}
      accessibilityRole='button'
      accessibilityState={{ disabled: isLoadingRoutes }}
    >
      <AppText variant='bodyMedium' style={styles.resetText}>
        Скинути
      </AppText>
    </Pressable>
    <View style={styles.apply}>
      <AppButton
        title='Показати маршрути'
        disabled={isLoadingRoutes}
        loading={isLoadingRoutes}
        onPress={onApply}
      />
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  reset: { minHeight: 48, justifyContent: 'center', paddingRight: 4 },
  resetText: { textDecorationLine: 'underline' },
  apply: { flex: 1 },
  disabled: { opacity: 0.45 },
})
