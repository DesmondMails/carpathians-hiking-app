import { StyleSheet, View } from 'react-native'

import { SkeletonBlock } from '@/src/shared/components/Skeleton'

// Mirrors SectionHeader: title lineHeight 26 + paddingBottom 12
export const SectionHeaderSkeleton = () => (
  <View style={styles.header}>
    <SkeletonBlock width={160} height={20} />
  </View>
)

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 3, paddingBottom: 15 },
})
