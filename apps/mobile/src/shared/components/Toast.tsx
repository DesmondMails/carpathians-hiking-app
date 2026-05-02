import { FC, useEffect } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import Animated, { FadeOutUp, SlideInUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  ToastItem,
  ToastVariant,
  useToastStore,
} from '@/src/shared/store/toast.store'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { AppText } from './AppText'

type IconName = React.ComponentProps<typeof Feather>['name']

const VARIANT_ICON: Record<ToastVariant, IconName> = {
  error: 'alert-circle',
  success: 'check-circle',
  info: 'info',
  warning: 'alert-triangle',
}

const VARIANT_BG: Record<ToastVariant, string> = {
  error: colors.warning,
  success: colors.primary,
  info: colors.primary,
  warning: '#f59e0b',
}

interface ToastRowProps {
  toast: ToastItem
}

const ToastRow: FC<ToastRowProps> = ({ toast }) => {
  const hide = useToastStore((s) => s.hide)

  useEffect(() => {
    const timer = setTimeout(() => hide(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, hide])

  return (
    <Animated.View
      entering={SlideInUp.duration(220)}
      exiting={FadeOutUp.duration(180)}
      style={[styles.row, { backgroundColor: VARIANT_BG[toast.variant] }]}
    >
      <Feather
        name={VARIANT_ICON[toast.variant]}
        size={20}
        color={colors.white}
      />
      <AppText
        variant='bodyMedium'
        color={colors.white}
        style={styles.message}
        numberOfLines={3}
      >
        {toast.message}
      </AppText>
      <Pressable
        onPress={() => hide(toast.id)}
        hitSlop={8}
        style={styles.closeBtn}
      >
        <Feather name='x' size={18} color={colors.white} />
      </Pressable>
    </Animated.View>
  )
}

export const ToastHost: FC = () => {
  const toasts = useToastStore((s) => s.toasts)
  const insets = useSafeAreaInsets()

  if (toasts.length === 0) return null

  return (
    <View
      pointerEvents='box-none'
      style={[styles.host, { top: insets.top + spacing.sm }]}
    >
      {toasts.map((t) => (
        <ToastRow key={t.id} toast={t} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.sm,
    zIndex: 1000,
    elevation: 1000,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  message: {
    flex: 1,
  },
  closeBtn: {
    padding: 2,
    opacity: 0.85,
  },
})
