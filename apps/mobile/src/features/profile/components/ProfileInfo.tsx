import { useState } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { EditNameSheet } from './EditNameSheet'
import { useAuthStore } from '../../auth/store/auth.store'

export const ProfileInfo = () => {
  const user = useAuthStore((state) => state.user)
  const [isEditing, setIsEditing] = useState(false)

  const firstLetter = user?.name?.charAt(0).toUpperCase() ?? 'U'

  return (
    <View style={styles.profileInfo}>
      <View style={styles.nameLetter} accessible={false}>
        <AppText
          variant='h1'
          color={colors.primaryDark}
          style={styles.initial}
          maxFontSizeMultiplier={1.3}
          accessible={false}
        >
          {firstLetter}
        </AppText>
      </View>

      <View style={styles.userInfo}>
        <AppText variant='title' style={styles.name}>
          {user?.name ?? 'Невідомий мандрівник'}
        </AppText>
        <AppText color={colors.textSecondary} style={styles.email}>
          {user?.email}
        </AppText>

        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Редагувати ім’я'
          hitSlop={12}
          onPress={() => setIsEditing(true)}
          style={({ pressed }) => [styles.editName, pressed && styles.pressed]}
        >
          <Feather name='edit-2' size={16} color={colors.primary} />

          <AppText variant='bodyMedium' color={colors.primary}>
            Редагувати
          </AppText>
        </Pressable>
      </View>
      {isEditing && (
        <EditNameSheet
          currentName={user?.name ?? ''}
          onClose={() => setIsEditing(false)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: 36,
  },
  nameLetter: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    width: 72,
    height: 72,
    borderRadius: 36,
    flexShrink: 0,
  },
  initial: {
    fontSize: 36,
    lineHeight: 44,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
  },
  email: {
    fontSize: 13,
    lineHeight: 20,
  },
  editName: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 22,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.65,
  },
})
