import { FC, useMemo, useState } from 'react'

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import { EditableRoute, UpdateRoutePayload } from '@hiking/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import {
  RouteMetadataFields,
} from '@/src/features/route-creation/components'
import {
  RouteMetadataFormValues,
  routeMetadataSchema,
} from '@/src/features/route-creation/schemas/route-metadata.schema'
import { DraftImageItem } from '@/src/features/route-creation/types'
import { AppButton, AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { RouteImagesField } from './RouteImagesField'

interface EditRouteFormProps {
  route: EditableRoute
  isSubmitting: boolean
  onSubmit: (payload: UpdateRoutePayload) => Promise<void>
}

const trimToUndefined = (value?: string) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const toDraftImageItem = (route: EditableRoute): DraftImageItem[] =>
  route.images.map((image) => ({
    localId: image.id,
    localUri: image.url,
    fileName: `${image.id}.jpg`,
    mimeType: 'image/jpeg',
    imageId: image.id,
    sortOrder: image.sortOrder,
    status: 'uploaded',
    isCover: image.isCover,
  }))

export const EditRouteForm: FC<EditRouteFormProps> = ({
  route,
  isSubmitting,
  onSubmit,
}) => {
  const initialImages = useMemo(() => toDraftImageItem(route), [route])
  const [images, setImages] = useState<DraftImageItem[]>(initialImages)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RouteMetadataFormValues>({
    resolver: zodResolver(routeMetadataSchema),
    mode: 'onChange',
    defaultValues: {
      title: route.title ?? '',
      description: route.description ?? '',
      region: route.region ?? '',
      difficulty: route.difficulty ?? 'EASY',
      notes: route.notes ?? '',
    },
  })

  const submit = async (values: RouteMetadataFormValues) => {
    try {
      await onSubmit({
        title: values.title.trim(),
        description: trimToUndefined(values.description),
        region: trimToUndefined(values.region),
        difficulty: values.difficulty,
        notes: trimToUndefined(values.notes),
      })
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? 'Не вдалося зберегти зміни'

      Alert.alert(
        'Помилка',
        Array.isArray(message) ? message.join(', ') : message,
      )
    }
  }

  const hasUploadingImages = images.some((image) => image.status === 'uploading')

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.header}>
          <AppText variant='h2' color={colors.textPrimary}>
            Редагувати маршрут
          </AppText>
          <AppText variant='body' color={colors.textSecondary}>
            Оновіть опис, складність і фото маршруту
          </AppText>
        </View>

        <RouteImagesField
          routeId={route.id}
          images={images}
          setImages={setImages}
        />

        <RouteMetadataFields control={control} errors={errors} />
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title='Зберегти зміни'
          onPress={handleSubmit(submit)}
          loading={isSubmitting}
          disabled={!isValid || isSubmitting || hasUploadingImages}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  footer: {
    paddingTop: spacing.md,
  },
})
