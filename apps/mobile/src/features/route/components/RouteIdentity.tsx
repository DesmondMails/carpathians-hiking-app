import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import type { RouteDetails } from '@hiking/shared'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'
import { typography } from '@/src/theme/typography'

import { DiffBadge } from '../../explore/components'

interface RouteIdentityProps {
  route: RouteDetails
}

export const RouteIdentity: FC<RouteIdentityProps> = ({ route }) => {
  return (
    <View style={styles.container}>
      <AppText style={styles.title} numberOfLines={2}>
        {route.title}
      </AppText>

      <View style={styles.descriptionRow}>
        <View style={styles.regionRow}>
          <Feather name='map-pin' size={12} color={colors.textSecondary} />
          <AppText
            variant='caption'
            color={colors.textSecondary}
            style={styles.region}
          >
            {route.region}
          </AppText>
        </View>

        {route?.difficulty ? <DiffBadge difficulty={route.difficulty} /> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  region: {
    flexShrink: 1,
  },
})
