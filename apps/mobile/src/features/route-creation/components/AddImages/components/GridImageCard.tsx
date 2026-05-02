import { FC } from 'react'

import { Image, Pressable, StyleSheet, View, ViewStyle } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { IconActionButton } from './IconActionButton'
import { ImageStateOverlay } from './ImageStateOverlay'
import { StatusBadge } from './StatusBadge'
import { GRID_ITEM_ASPECT_RATIO } from '../../../constants'
import { DraftImageItem } from '../../../types'

interface GridImageCardProps {
  image: DraftImageItem
  onRemoveImage: (localId: string) => void
  onMakeCover: (localId: string) => void
  size?: ViewStyle
}

export const GridImageCard: FC<GridImageCardProps> = ({
  image,
  onRemoveImage,
  onMakeCover,
  size,
}) => (
  <View style={[styles.gridCard, size]}>
    <Image source={{ uri: image.localUri }} style={styles.gridImage} />

    <View style={styles.topRowCompact}>
      <StatusBadge status={image.status} compact />
      <IconActionButton
        icon='close'
        onPress={() => onRemoveImage(image.localId)}
        compact
      />
    </View>

    {image.status === 'uploaded' ? (
      <View style={styles.gridFooter}>
        <Pressable
          style={styles.gridCoverAction}
          onPress={() => onMakeCover(image.localId)}
        >
          <Ionicons name='star-outline' size={12} color={colors.textWhite} />
          <AppText variant='caption' color={colors.textWhite}>
            Обкладинка
          </AppText>
        </Pressable>
      </View>
    ) : null}

    <ImageStateOverlay status={image.status} compact />
  </View>
)

const styles = StyleSheet.create({
  topRowCompact: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridCard: {
    position: 'relative',
    width: '31%',
    aspectRatio: GRID_ITEM_ASPECT_RATIO,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.gray100,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridFooter: {
    position: 'absolute',
    left: spacing.xs,
    right: spacing.xs,
    bottom: spacing.xs,
  },
  gridCoverAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.transparentDark,
  },
})
