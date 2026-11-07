import { Pressable, StyleSheet } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

export const MyReviewsBtn = () => (
  <Pressable
    accessibilityRole='button'
    style={({ pressed }) => [styles.myReviews, pressed && styles.pressed]}
  >
    <Feather name='star' size={24} color={colors.textPrimary} />
    <AppText variant='button' style={styles.reviewsLabel}>
      Мої оцінки
    </AppText>

    <Feather name='chevron-right' size={22} color={colors.gray400} />
  </Pressable>
)

const styles = StyleSheet.create({
  myReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    marginTop: 36,
    backgroundColor: colors.surface,
    borderColor: colors.gray200,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  reviewsLabel: {
    flex: 1,
  },
  pressed: {
    opacity: 0.65,
  },
})
