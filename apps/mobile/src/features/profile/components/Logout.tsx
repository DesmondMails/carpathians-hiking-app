import { Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { useAuthStore } from '../../auth/store/auth.store'

export const Logout = () => {
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <View style={styles.footer}>
      <Pressable
        accessibilityRole='button'
        style={({ pressed }) => [styles.exitBtn, pressed && styles.pressed]}
        onPress={handleLogout}
      >
        <Feather name='log-out' size={20} color={colors.textSecondary} />
        <AppText
          variant='bodyMedium'
          color={colors.textSecondary}
          style={styles.exitLabel}
        >
          Вийти з акаунта
        </AppText>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 'auto',
    paddingTop: 40,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 44,
    gap: spacing.md,
  },
  exitLabel: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.65,
  },
})
