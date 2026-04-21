import { FC } from 'react'

import { View, StyleSheet, Pressable } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

interface CreateRouteModalWrapperProps {
  children: React.ReactNode
  onBack?: () => void
  onClose?: () => void
  showBack?: boolean
}

export const CreateRouteModalWrapper: FC<CreateRouteModalWrapperProps> = ({
  children,
  onBack,
  onClose,
  showBack = false,
}) => {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }
    if (router.canGoBack()) {
      router.back()
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
      return
    }
    if (router.canDismiss()) {
      router.dismissAll()
    }
    requestAnimationFrame(() => {
      if (router.canGoBack()) {
        router.back()
      }
    })
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerSide}>
          {showBack ? (
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              style={styles.iconButton}
            >
              <Feather
                name='arrow-left'
                size={22}
                color={colors.textPrimary}
              />
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.headerSide, styles.headerSideEnd]}>
          <Pressable
            onPress={handleClose}
            hitSlop={12}
            style={styles.iconButton}
          >
            <Feather name='x' size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.white,
    paddingBottom: 22,
    paddingHorizontal: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  headerSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSideEnd: {
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
