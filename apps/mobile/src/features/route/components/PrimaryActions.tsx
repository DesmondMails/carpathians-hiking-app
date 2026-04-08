import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppButton } from '@/src/shared/components/AppButton'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

interface PrimaryActionsProps {
  onDownloadGpx: () => void
  onOpenExternal: () => void
  gpxAvailable?: boolean
}

export const PrimaryActions: FC<PrimaryActionsProps> = ({
  onDownloadGpx,
  onOpenExternal,
  gpxAvailable = true,
}) => {
  const { bottom } = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingBottom: bottom - 12 }]}>
      <View style={styles.bar}>
        <View style={styles.downloadWrapper}>
          <AppButton
            title='Завантажити GPX'
            icon={<Feather name='download' size={16} color={colors.white} />}
            onPress={onDownloadGpx}
            disabled={!gpxAvailable}
            size='medium'
            variant='primary'
          />
        </View>
        <AppButton
          icon={
            <Feather name='external-link' size={18} color={colors.primary} />
          }
          onPress={onOpenExternal}
          size='medium'
          variant='outline'
          shape='circle'
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  downloadWrapper: {
    flex: 1,
  },
})
