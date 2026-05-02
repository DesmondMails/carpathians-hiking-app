import { FC } from 'react'

import { Pressable, StyleSheet } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { colors } from '@/src/theme/colors'

interface IconActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
  compact?: boolean
}

export const IconActionButton: FC<IconActionButtonProps> = ({
  icon,
  onPress,
  compact = false,
}) => (
  <Pressable
    style={[styles.iconAction, compact && styles.iconActionCompact]}
    onPress={onPress}
    hitSlop={8}
  >
    <Ionicons name={icon} size={compact ? 14 : 16} color={colors.textWhite} />
  </Pressable>
)

const styles = StyleSheet.create({
  iconAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.transparentDark,
  },
  iconActionCompact: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
})
