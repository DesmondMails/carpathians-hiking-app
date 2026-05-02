import { FC, useState } from 'react'

import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'

import { AppText } from '@/src/shared/components'
import { toast } from '@/src/shared/store/toast.store'
import { colors } from '@/src/theme/colors'
import { shadow } from '@/src/theme/shadow'
import { spacing } from '@/src/theme/spacing'

import {
  GridImageCard,
  IconActionButton,
  ImageStateOverlay,
  StatusBadge,
} from './components'
import { GRID_ITEM_ASPECT_RATIO } from '../../constants'
import { DraftImageItem } from '../../types'

interface AddImagesProps {
  items: DraftImageItem[]
  onSelectImage: (assets: ImagePicker.ImagePickerAsset[]) => Promise<void>
  onRemoveImage: (localId: string) => void
  onMakeCover: (localId: string) => void
}

const MAX_IMAGES = 10
const GRID_COLUMNS = 3

export const AddImages: FC<AddImagesProps> = ({
  items,
  onSelectImage,
  onRemoveImage,
  onMakeCover,
}) => {
  const [gridWidth, setGridWidth] = useState(0)
  const coverImage = items.find((image) => image.isCover) ?? items[0]
  const galleryImages = coverImage
    ? items.filter((image) => image.localId !== coverImage.localId)
    : []
  const remainingSlots = MAX_IMAGES - items.length
  const isAtLimit = remainingSlots <= 0
  const gridGap = spacing.md
  const tileWidth =
    gridWidth > 0
      ? (gridWidth - gridGap * (GRID_COLUMNS - 1)) / GRID_COLUMNS
      : undefined
  const tileHeight = tileWidth ? tileWidth / GRID_ITEM_ASPECT_RATIO : undefined
  const tileStyle =
    tileWidth && tileHeight ? { width: tileWidth, height: tileHeight } : null

  const pickImage = async () => {
    if (isAtLimit) {
      toast.error('Максимум 10 фото для одного маршруту.')
      return
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      toast.error('Дозвіл на доступ до медіа не отримано.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      orderedSelection: true,
    })

    if (!result.canceled) {
      await onSelectImage(result.assets.slice(0, remainingSlots))
    }
  }

  const handleGridLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const nextWidth = nativeEvent.layout.width

    if (nextWidth !== gridWidth) {
      setGridWidth(nextWidth)
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant='title' color={colors.textPrimary}>
            Фото маршруту
          </AppText>
          <AppText variant='body' color={colors.textSecondary}>
            До 10 фото для маршруту
          </AppText>
        </View>

        <View style={styles.counterBadge}>
          <AppText variant='bodyMedium' color={colors.primaryDark}>
            {items.length}/{MAX_IMAGES}
          </AppText>
        </View>
      </View>

      {coverImage ? (
        <View style={styles.content}>
          <View style={styles.coverSection}>
            <View style={styles.sectionHeader}>
              <AppText variant='bodyMedium' color={colors.textPrimary}>
                Обкладинка
              </AppText>
              <AppText variant='caption' color={colors.textSecondary}>
                Головне фото маршруту
              </AppText>
            </View>

            <View style={styles.coverCard}>
              <Image
                source={{ uri: coverImage.localUri }}
                style={styles.coverImage}
              />

              <View style={styles.topRow}>
                <StatusBadge status={coverImage.status} />
                <IconActionButton
                  icon='close'
                  onPress={() => onRemoveImage(coverImage.localId)}
                />
              </View>

              <View style={styles.coverFooter}>
                <View style={styles.coverBadge}>
                  <Ionicons name='star' size={14} color={colors.primaryDark} />
                  <AppText variant='bodyMedium' color={colors.primaryDark}>
                    Обкладинка
                  </AppText>
                </View>
              </View>

              <ImageStateOverlay status={coverImage.status} />
            </View>
          </View>

          <View style={styles.gridSection}>
            <View style={styles.sectionHeader}>
              <AppText variant='bodyMedium' color={colors.textPrimary}>
                Інші фото
              </AppText>
              <AppText variant='caption' color={colors.textSecondary}>
                {isAtLimit
                  ? 'Максимум 10 фото'
                  : `Залишилось ${remainingSlots} слотів`}
              </AppText>
            </View>

            <View style={styles.grid} onLayout={handleGridLayout}>
              {galleryImages.map((image) => (
                <GridImageCard
                  key={image.localId}
                  image={image}
                  onRemoveImage={onRemoveImage}
                  onMakeCover={onMakeCover}
                  size={tileStyle ?? undefined}
                />
              ))}

              {!isAtLimit ? (
                <Pressable
                  style={[styles.addTile, tileStyle]}
                  onPress={pickImage}
                >
                  <View style={styles.addTileIcon}>
                    <Ionicons
                      name='images-outline'
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <AppText variant='bodyMedium' color={colors.textPrimary}>
                    Додати ще
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      ) : (
        <Pressable style={styles.emptyState} onPress={pickImage}>
          <View style={styles.emptyIcon}>
            <Ionicons name='images-outline' size={34} color={colors.primary} />
          </View>
          <AppText variant='bodyMedium' color={colors.textPrimary}>
            Додати фото
          </AppText>
          <AppText
            variant='body'
            color={colors.textSecondary}
            style={styles.emptyText}
          >
            Завантажте до 10 фото
          </AppText>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  counterBadge: {
    minWidth: 62,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  content: {
    gap: spacing.lg,
  },
  sectionHeader: {
    gap: spacing.xs,
  },
  coverSection: {
    gap: spacing.sm,
  },
  coverCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: colors.gray100,
    ...shadow.card,
  },
  coverImage: {
    width: '100%',
    aspectRatio: 1.45,
  },
  topRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverFooter: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  coverBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.white,
  },
  gridSection: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  addTile: {
    width: '31%',
    aspectRatio: GRID_ITEM_ASPECT_RATIO,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  addTileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 24,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  emptyText: {
    textAlign: 'center',
  },
})
