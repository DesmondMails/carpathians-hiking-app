import { FC } from 'react'
import { Pressable, ScrollView, StyleSheet } from 'react-native'
import { AppText } from './AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

interface HorizontalSelectionProps {
  items: { label: string; active: boolean }[]
  onItemPress: (item: string) => void
}

export const HorizontalSelection: FC<HorizontalSelectionProps> = ({
  items,
  onItemPress,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesRow}
    >
      {items.map((item) => {
        return (
          <Pressable
            key={item.label}
            style={[
              styles.categoryPill,
              item.active && styles.categoryPillActive,
            ]}
            onPress={() => onItemPress(item.label)}
          >
            <AppText
              style={[
                styles.categoryText,
                item.active && styles.categoryTextActive,
              ]}
            >
              {item.label}
            </AppText>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  categoriesRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    borderRadius: 200,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gray200,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.white,
  },
})
