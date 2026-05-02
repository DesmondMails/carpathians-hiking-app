import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { AppText } from '@/src/shared/components/AppText'
import { spacing } from '@/src/theme/spacing'

import { DraftImageItem } from '../../../types'
import { getStatusMeta } from '../helpers'

interface StatusBadgeProps {
  status: DraftImageItem['status']
  compact?: boolean
}

export const StatusBadge: FC<StatusBadgeProps> = ({
  status,
  compact = false,
}) => {
  const meta = getStatusMeta(status)

  return (
    <View
      style={[
        styles.statusBadge,
        compact && styles.statusBadgeCompact,
        { backgroundColor: meta.backgroundColor },
      ]}
    >
      <AppText variant='caption' color={meta.textColor}>
        {meta.label}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  statusBadgeCompact: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
})
