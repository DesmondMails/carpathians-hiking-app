import { FC } from 'react'

import { Pressable, View, StyleSheet } from 'react-native'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

interface SectionHeaderProps {
  title: string
  onSeeAll?: () => void
}

export const SectionHeader: FC<SectionHeaderProps> = ({ title, onSeeAll }) => {
  return (
    <View style={sh.row}>
      <AppText style={sh.title}>{title}</AppText>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <AppText style={sh.seeAll}>Всі</AppText>
        </Pressable>
      )}
    </View>
  )
}

const sh = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 20,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: colors.primary,
  },
})
