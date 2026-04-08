import { FC, Dispatch, SetStateAction } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

interface ModeSwitcherProps {
  mode: 'map' | 'photos'
  setMode: Dispatch<SetStateAction<'map' | 'photos'>>
  photosCount?: number
}

export const ModeSwitcher: FC<ModeSwitcherProps> = ({
  mode,
  setMode,
  photosCount = 3,
}) => {
  const handlePress = () => {
    setMode((m) => (m === 'map' ? 'photos' : 'map'))
  }

  const isMapMode = mode === 'map'

  return (
    <Pressable style={styles.toggleBtn} onPress={handlePress} hitSlop={8}>
      <View style={styles.content}>
        <Feather
          name={isMapMode ? 'image' : 'map'}
          size={14}
          color={colors.textWhite}
        />
        {isMapMode && <AppText style={styles.countText}>{photosCount}</AppText>}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  toggleBtn: {
    position: 'absolute',
    right: 16,
    bottom: 42,
    minWidth: 40,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.transparentDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countText: {
    fontSize: 12,
    fontFamily: typography.bodyMedium.fontFamily,
    color: colors.textWhite,
  },
})
