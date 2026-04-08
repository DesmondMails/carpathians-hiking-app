import { FC } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { Feather, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors } from '@/src/theme/colors'

interface ControlsTopProps {
  onSave: () => void
  onShare: () => void
  saved: boolean
}

export const ControlsTop: FC<ControlsTopProps> = ({
  onSave,
  onShare,
  saved,
}) => {
  const { top } = useSafeAreaInsets()

  const router = useRouter()

  return (
    <View style={[styles.topRow, { paddingTop: top + 10 }]}>
      <Pressable
        style={styles.iconBtn}
        onPress={() => router.back()}
        hitSlop={8}
      >
        <Feather name='arrow-left' size={18} color={colors.textWhite} />
      </Pressable>

      <View style={styles.rightCluster}>
        <Pressable style={styles.iconBtn} onPress={onSave} hitSlop={8}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={saved ? colors.primary : colors.textWhite}
          />
        </Pressable>

        <Pressable style={styles.iconBtn} onPress={onShare} hitSlop={8}>
          <Feather name='share-2' size={16} color={colors.textWhite} />
        </Pressable>
      </View>
    </View>
  )
}

export const styles = StyleSheet.create({
  topRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    zIndex: 9999,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.transparentDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
})
