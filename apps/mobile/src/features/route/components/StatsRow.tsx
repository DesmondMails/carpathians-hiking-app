import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Feather, Ionicons } from '@expo/vector-icons'
import type { RouteDetails } from '@hiking/shared'

import { AppText } from '@/src/shared/components/AppText'
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatRating,
} from '@/src/shared/formatters'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'
import { typography } from '@/src/theme/typography'

interface StatItemProps {
  icon: React.ReactNode
  value: string
  isLast?: boolean
}

const StatItem: FC<StatItemProps> = ({ icon, value, isLast }) => (
  <>
    <View style={styles.item}>
      {icon}
      <AppText style={styles.value}>{value}</AppText>
    </View>
  </>
)

interface StatsRowProps {
  route: RouteDetails
}

export const StatsRow: FC<StatsRowProps> = ({ route }) => (
  <View style={styles.row}>
    <StatItem
      icon={<Feather name='map' size={15} color={colors.primary} />}
      value={formatDistance(route.distanceM)}
    />
    <StatItem
      icon={<Feather name='trending-up' size={15} color={colors.primary} />}
      value={formatElevation(route.elevationGainM)}
    />
    <StatItem
      icon={<Feather name='clock' size={15} color={colors.primary} />}
      value={formatDuration(route.durationH)}
    />
    <StatItem
      icon={<Ionicons name='star' size={15} color='#f59e0b' />}
      value={formatRating(route.rating, route.reviewCount)}
      isLast
    />
  </View>
)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  value: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textPrimary,
  },
  label: {
    fontFamily: typography.body.fontFamily,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  diffBadge: {
    marginLeft: 'auto',
  },
})
