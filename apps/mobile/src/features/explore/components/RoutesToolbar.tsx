import { FC } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

interface RoutesToolbarProps {
  viewMode: 'list' | 'map'
  onToggle: () => void
  onSort: () => void
}

export const RoutesToolbar: FC<RoutesToolbarProps> = ({
  viewMode,
  onToggle,
  onSort,
}) => {
  return (
    <View style={styles.bar}>
      <Pressable style={styles.sortBtn} onPress={onSort}>
        <Feather name='sliders' size={14} color={colors.textPrimary} />
        <AppText style={styles.sortText}>Сортувати</AppText>
      </Pressable>
      <View style={styles.filterChips}>
        <View style={styles.activeChip}>
          <AppText style={styles.activeChipText}>Карпати</AppText>
          <Feather name='x' size={11} color={colors.primary} />
        </View>
      </View>
      <Pressable style={styles.toggle} onPress={onToggle}>
        <Feather
          name={viewMode === 'list' ? 'map' : 'list'}
          size={16}
          color={colors.textPrimary}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  sortText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: colors.textPrimary,
  },
  filterChips: { flex: 1, flexDirection: 'row', gap: 6 },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  activeChipText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 11,
    color: colors.primary,
  },
  toggle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
})
