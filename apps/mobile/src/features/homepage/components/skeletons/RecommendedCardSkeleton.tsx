import { StyleSheet, View } from 'react-native'

import { SkeletonBlock } from '@/src/shared/components/Skeleton'
import { colors } from '@/src/theme/colors'

const CTA_COUNT = 3

// Mirrors RecommendedCard: update the sizes here when its layout changes
export const RecommendedCardSkeleton = () => (
  <View style={styles.card}>
    <SkeletonBlock height={200} radius={0} style={styles.image} />
    <View style={styles.body}>
      <SkeletonBlock width='80%' height={14} />
      <View style={styles.rowBetween}>
        <SkeletonBlock width={64} height={22} />
        <SkeletonBlock width={56} height={14} />
      </View>
      <SkeletonBlock height={28} radius={8} />
      <View style={styles.ctaRow}>
        {Array.from({ length: CTA_COUNT }, (_, i) => (
          <SkeletonBlock key={i} height={32} radius={10} style={styles.cta} />
        ))}
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  image: { backgroundColor: colors.gray100 },
  body: { padding: 14, gap: 10 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    paddingTop: 10,
  },
  cta: { flex: 1 },
})
