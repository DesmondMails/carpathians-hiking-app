import { StyleSheet, View } from 'react-native'

import { SkeletonPulse } from '@/src/shared/components/Skeleton'

import {
  NearbyCardSkeleton,
  RecommendedCardSkeleton,
  SectionHeaderSkeleton,
} from './skeletons'

const NEARBY_PLACEHOLDERS = 3
const RECOMMENDED_PLACEHOLDERS = 2

export const HomepageSkeleton = () => (
  <SkeletonPulse style={styles.content} label='Завантажуємо маршрути…'>
    <View style={styles.section}>
      <SectionHeaderSkeleton />
      <View style={styles.hRow}>
        {Array.from({ length: NEARBY_PLACEHOLDERS }, (_, i) => (
          <NearbyCardSkeleton key={i} />
        ))}
      </View>
    </View>

    <View style={styles.section}>
      <SectionHeaderSkeleton />
      <View style={styles.vGap}>
        {Array.from({ length: RECOMMENDED_PLACEHOLDERS }, (_, i) => (
          <RecommendedCardSkeleton key={i} />
        ))}
      </View>
    </View>
  </SkeletonPulse>
)

const styles = StyleSheet.create({
  content: { paddingTop: 8 },
  section: { marginTop: 8, marginBottom: 24 },
  hRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
    overflow: 'hidden',
  },
  vGap: { gap: 16 },
})
