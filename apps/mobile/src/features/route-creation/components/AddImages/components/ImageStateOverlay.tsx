import { FC } from 'react'

import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { DraftImageItem } from '../../../types'

interface ImageStateOverlayProps {
  status: DraftImageItem['status']
  compact?: boolean
}

export const ImageStateOverlay: FC<ImageStateOverlayProps> = ({
  status,
  compact = false,
}) => {
  if (status === 'uploaded') {
    return null
  }

  return (
    <View style={[styles.stateOverlay, compact && styles.stateOverlayCompact]}>
      {status === 'uploading' ? (
        <>
          <ActivityIndicator color={colors.textWhite} size='small' />
          <AppText variant='caption' color={colors.textWhite}>
            Завантажується...
          </AppText>
        </>
      ) : (
        <>
          <Ionicons
            name='alert-circle'
            size={compact ? 18 : 20}
            color={colors.textWhite}
          />
          <AppText variant='caption' color={colors.textWhite}>
            Помилка
          </AppText>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  stateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(4, 53, 33, 0.56)',
  },
  stateOverlayCompact: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
})
