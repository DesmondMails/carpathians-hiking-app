import { FC } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { AppButton, AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'

type BottomControllersProps = { onReset: () => void; onApply: () => void }

export const BottomControllers: FC<BottomControllersProps> = ({
  onReset,
  onApply,
}) => (
  <View style={styles.container}>
    <Pressable
      onPress={onReset}
      style={styles.reset}
      accessibilityRole='button'
    >
      <AppText variant='bodyMedium' style={styles.resetText}>
        Скинути
      </AppText>
    </Pressable>
    <View style={styles.apply}>
      <AppButton title='Показати маршрути' onPress={onApply} />
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
})
