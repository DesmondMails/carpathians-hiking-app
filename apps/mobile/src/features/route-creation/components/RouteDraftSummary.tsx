import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import {
  Difficulty,
  DIFFICULTY_DURATION_MULTIPLIER,
  RouteDraft,
} from '@hiking/shared'

import { AppText } from '@/src/shared/components'
import { formatDuration } from '@/src/shared/utils/formatDuration'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

interface RouteDraftSummaryProps {
  routeDraft: RouteDraft
  difficulty?: Difficulty
}

export const RouteDraftSummary: FC<RouteDraftSummaryProps> = ({
  routeDraft,
  difficulty = 'MODERATE',
}) => {
  const preview = routeDraft.previewJson

  const distanceKm =
    preview?.distanceM != null ? preview.distanceM / 1000 : undefined
  const elevationGainM = preview?.elevationGainM
  // Same rounding as the API on finalize, so the saved route shows this value
  const durationH =
    preview?.baseDurationH != null
      ? Number(
          (
            preview.baseDurationH * DIFFICULTY_DURATION_MULTIPLIER[difficulty]
          ).toFixed(1),
        )
      : undefined

  const stats: { icon: keyof typeof Feather.glyphMap; label: string }[] = []

  if (distanceKm != null) {
    stats.push({
      icon: 'map',
      label: `${distanceKm.toFixed(1)} км`,
    })
  }

  if (elevationGainM != null) {
    stats.push({
      icon: 'trending-up',
      label: `${Math.round(elevationGainM)} м`,
    })
  }

  if (durationH != null) {
    stats.push({
      icon: 'clock',
      label: formatDuration(durationH),
    })
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Feather name='file-text' size={18} color={colors.primary} />
        <AppText
          variant='bodyMedium'
          color={colors.textPrimary}
          numberOfLines={1}
          style={styles.fileName}
        >
          {routeDraft.sourceFileName}
        </AppText>
      </View>

      {stats.length ? (
        <View style={styles.stats}>
          {stats.map((stat) => (
            <View key={stat.icon} style={styles.stat}>
              <Feather
                name={stat.icon}
                size={14}
                color={colors.textSecondary}
              />
              <AppText variant='caption' color={colors.textSecondary}>
                {stat.label}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fileName: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
})
