import { StyleSheet, View } from 'react-native'

import { SkeletonBlock } from '@/src/shared/components/Skeleton'
import { colors } from '@/src/theme/colors'

import { useNearbyCardWidth } from '../../hooks/useNearbyCardWidth'

// Mirrors NearbyCard: update the sizes here when its layout changes
export const NearbyCardSkeleton = () => {
  const width = useNearbyCardWidth()

  return (
    <View style={[styles.card, { width }]}>
      <SkeletonBlock height={130} radius={0} style={styles.image} />
      <View style={styles.body}>
        <SkeletonBlock width='85%' height={14} />
        <View style={styles.rowBetween}>
          <SkeletonBlock width={56} height={22} />
          <SkeletonBlock width={32} height={14} />
        </View>
        <SkeletonBlock width='60%' height={12} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  image: { backgroundColor: colors.gray100 },
  body: { padding: 10, gap: 6 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
