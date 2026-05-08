import { Dispatch, FC, SetStateAction } from 'react'

import * as ImagePicker from 'expo-image-picker'

import { routeEditApi } from '@/src/features/route/api/route-edit.api'
import { AddImages } from '@/src/features/route-creation/components'
import { DraftImageItem } from '@/src/features/route-creation/types'
import { toast } from '@/src/shared/store/toast.store'
import { uploadAssetToPresignedUrl } from '@/src/shared/utils/uploadToPresignedUrl'

interface RouteImagesFieldProps {
  routeId: string
  images: DraftImageItem[]
  setImages: Dispatch<SetStateAction<DraftImageItem[]>>
}

const getNextSortOrder = (images: DraftImageItem[]) =>
  images.reduce((maxSortOrder, image) => {
    return Math.max(maxSortOrder, image.sortOrder)
  }, -1) + 1

export const RouteImagesField: FC<RouteImagesFieldProps> = ({
  routeId,
  images,
  setImages,
}) => {
  const handleAddImage = async (assets: ImagePicker.ImagePickerAsset[]) => {
    const nextSortOrder = getNextSortOrder(images)
    const hasCoverImage = images.some((image) => image.isCover)
    const optimisticItems = assets.map((asset, index) => ({
      localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      localUri: asset.uri,
      fileName: asset.fileName ?? 'image.jpg',
      mimeType: asset.mimeType ?? 'image/jpeg',
      sortOrder: nextSortOrder + index,
      status: 'uploading' as const,
      isCover: !hasCoverImage && index === 0,
    }))

    setImages((prev) => [...prev, ...optimisticItems])

    for (const optimisticItem of optimisticItems) {
      try {
        const presignedUrlData = await routeEditApi.getPresignedUrl(routeId, {
          fileName: optimisticItem.fileName,
          contentType: optimisticItem.mimeType,
        })

        await uploadAssetToPresignedUrl(presignedUrlData.uploadUrl, {
          uri: optimisticItem.localUri,
          mimeType: optimisticItem.mimeType,
        })

        await routeEditApi.completeImageUpload(routeId, {
          imageId: presignedUrlData.imageId,
          storageKey: presignedUrlData.storageKey,
          sortOrder: optimisticItem.sortOrder,
        })

        let shouldSetAsCover = false

        setImages((prev) =>
          prev.map((image) => {
            if (image.localId !== optimisticItem.localId) {
              return image
            }

            shouldSetAsCover = image.isCover

            return {
              ...image,
              imageId: presignedUrlData.imageId,
              storageKey: presignedUrlData.storageKey,
              status: 'uploaded',
            }
          }),
        )

        if (shouldSetAsCover) {
          await routeEditApi.setCoverImage(routeId, {
            imageId: presignedUrlData.imageId,
          })
        }
      } catch (error) {
        console.error('Upload route image error', error)
        setImages((prev) =>
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
    const image = images.find((item) => item.localId === localId)

    if (!image) return

    try {
      if (image.imageId) {
        await routeEditApi.deleteImage(routeId, image.imageId)
      }
    } catch (error) {
      console.error('Delete route image error', error)
      toast.error('Не вдалося видалити зображення. Спробуйте ще раз.')
      return
    }

    setImages((prev) => {
      const nextImages = prev.filter((item) => item.localId !== localId)

      if (nextImages.length > 0 && !nextImages.some((item) => item.isCover)) {
        nextImages[0] = {
          ...nextImages[0],
          isCover: true,
        }
      }

      return nextImages
    })
  }

  const handleMakeCover = async (localId: string) => {
    const currentImages = images
    const image = currentImages.find((item) => item.localId === localId)

    if (!image) return

    setImages((prev) =>
      prev.map((item) => ({
        ...item,
        isCover: item.localId === localId,
      })),
    )

    if (!image.imageId) {
      return
    }

    try {
      await routeEditApi.setCoverImage(routeId, {
        imageId: image.imageId,
      })
    } catch (error) {
      console.error('Set route cover error', error)
      setImages(currentImages)
      toast.error('Не вдалося оновити обкладинку. Спробуйте ще раз.')
    }
  }

  return (
    <AddImages
      items={images}
      onSelectImage={handleAddImage}
      onRemoveImage={handleRemoveImage}
      onMakeCover={handleMakeCover}
    />
  )
}
