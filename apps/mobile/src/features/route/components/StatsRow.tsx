import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Feather, Ionicons } from '@expo/vector-icons'
import type { RouteDetails } from '@hiking/shared'

import { AppText } from '@/src/shared/components/AppText'
import { toFixedNumber } from '@/src/shared/utils/toFixedNumber'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'
import { typography } from '@/src/theme/typography'

import { formatDuration } from '../utils/formatDuration'

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
      value={`${toFixedNumber(route.distanceM ? route.distanceM / 1000 : 0)} км`}
    />
    <StatItem
      icon={<Feather name='trending-up' size={15} color={colors.primary} />}
      value={`${route.elevationGainM} м`}
    />
    <StatItem
      icon={<Feather name='clock' size={15} color={colors.primary} />}
      value={formatDuration(route.durationH ?? 0)}
    />
    <StatItem
      icon={<Ionicons name='star' size={15} color='#f59e0b' />}
      value={`${route.rating || 'N/A'}`}
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
