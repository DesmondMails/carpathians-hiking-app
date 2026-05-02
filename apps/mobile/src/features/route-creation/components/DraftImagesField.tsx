import { Dispatch, FC, SetStateAction } from 'react'

import * as ImagePicker from 'expo-image-picker'

import { toast } from '@/src/shared/store/toast.store'
import { uploadAssetToPresignedUrl } from '@/src/shared/utils/uploadToPresignedUrl'

import { AddImages } from './AddImages'
import { useCreateRoute } from '../hooks/useCreateRoute'
import { DraftImageItem } from '../types'

interface DraftImagesFieldProps {
  routeDraftId: string
  draftImages: DraftImageItem[]
  setDraftImages: Dispatch<SetStateAction<DraftImageItem[]>>
}

const reindexImages = (images: DraftImageItem[]) =>
  images.map((image, index) => ({
    ...image,
    sortOrder: index,
  }))

export const DraftImagesField: FC<DraftImagesFieldProps> = ({
  routeDraftId,
  draftImages,
  setDraftImages,
}) => {
  const { getPresignedUrl, completeImageUpload, deleteImage } = useCreateRoute()

  const handleAddImage = async (assets: ImagePicker.ImagePickerAsset[]) => {
    const nextSortOrder = draftImages.length
    const hasCoverImage = draftImages.some((image) => image.isCover)
    const optimisticItems = assets.map((asset, index) => ({
      localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      localUri: asset.uri,
      fileName: asset.fileName ?? 'image.jpg',
      mimeType: asset.mimeType ?? 'image/jpeg',
      sortOrder: nextSortOrder + index,
      status: 'uploading' as const,
      isCover: !hasCoverImage && index === 0,
    }))

    setDraftImages((prev) => [...prev, ...optimisticItems])

    for (const optimisticItem of optimisticItems) {
      try {
        const presignedUrlData = await getPresignedUrl(routeDraftId, {
          fileName: optimisticItem.fileName,
          contentType: optimisticItem.mimeType,
        })

        await uploadAssetToPresignedUrl(presignedUrlData.uploadUrl, {
          uri: optimisticItem.localUri,
          mimeType: optimisticItem.mimeType,
        })

        await completeImageUpload(routeDraftId, {
          imageId: presignedUrlData.imageId,
          storageKey: presignedUrlData.storageKey,
          sortOrder: optimisticItem.sortOrder,
        })

        setDraftImages((prev) =>
          prev.map((image) =>
            image.localId === optimisticItem.localId
              ? {
                  ...image,
                  imageId: presignedUrlData.imageId,
                  storageKey: presignedUrlData.storageKey,
                  status: 'uploaded',
                }
              : image,
          ),
        )
      } catch (error) {
        console.error('Upload image error', error)
        setDraftImages((prev) =>
          prev.map((image) =>
            image.localId === optimisticItem.localId
              ? { ...image, status: 'failed' }
              : image,
          ),
        )
        toast.error('Не вдалося завантажити зображення. Спробуйте ще раз.')
      }
    }
  }

  const handleRemoveImage = async (localId: string) => {
    const image = draftImages.find((image) => image.localId === localId)

    if (!image) return

    try {
      if (image.imageId) {
        await deleteImage(routeDraftId, image.imageId)
      }
    } catch (error) {
      console.error('Delete image error', error)
      toast.error('Не вдалося видалити зображення. Спробуйте ще раз.')
      return
    }

    setDraftImages((prev) => {
      const nextImages = reindexImages(
        prev.filter((image) => image.localId !== localId),
      )

      if (nextImages.length > 0 && !nextImages.some((image) => image.isCover)) {
        nextImages[0] = {
          ...nextImages[0],
          isCover: true,
        }
      }

      return nextImages
    })
  }

  const handleMakeCover = (localId: string) => {
    setDraftImages((prev) =>
      prev.map((image) => ({
        ...image,
        isCover: image.localId === localId,
      })),
    )
  }

  return (
    <AddImages
      items={draftImages}
      onSelectImage={handleAddImage}
      onRemoveImage={handleRemoveImage}
      onMakeCover={handleMakeCover}
    />
  )
}
