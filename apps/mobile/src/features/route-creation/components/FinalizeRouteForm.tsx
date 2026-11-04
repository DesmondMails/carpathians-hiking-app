import { FC, useState } from 'react'

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import { FinalizeRouteDraftPayload, RouteDraft } from '@hiking/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { AppButton, AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { DraftImagesField } from './DraftImagesField'
import { RouteDraftSummary } from './RouteDraftSummary'
import { RouteMetadataFields } from './RouteMetadataFields'
import {
  FinalizeRouteFormValues,
  finalizeRouteSchema,
} from '../schemas/finalize-route.schema'
import { DraftImageItem } from '../types'

interface FinalizeRouteFormProps {
  routeDraft: RouteDraft
  isSubmitting: boolean
  onSubmit: (payload: FinalizeRouteDraftPayload) => Promise<void>
}

const trimToUndefined = (value?: string) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export const FinalizeRouteForm: FC<FinalizeRouteFormProps> = ({
  routeDraft,
  isSubmitting,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FinalizeRouteFormValues>({
    resolver: zodResolver(finalizeRouteSchema),
    mode: 'onChange',
    defaultValues: {
      title: routeDraft.title ?? '',
      description: routeDraft.description ?? '',
      region: routeDraft.previewJson?.region ?? '',
      difficulty: 'EASY',
    },
  })

  const difficulty = useWatch({ control, name: 'difficulty' })

  const [draftImages, setDraftImages] = useState<DraftImageItem[]>([])

  const submit = async (values: FinalizeRouteFormValues) => {
    const uploadedImages = draftImages.filter(
      (image) => image.status === 'uploaded' && image.imageId,
    )
    const coverImageId =
      uploadedImages.find((image) => image.isCover)?.imageId ??
      uploadedImages[0]?.imageId

    try {
      await onSubmit({
        title: values.title.trim(),
        description: trimToUndefined(values.description),
        region: trimToUndefined(values.region),
        difficulty: values.difficulty,
        imageIds: uploadedImages.map((image) => image.imageId!),
        coverImageId,
      })
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? 'Не вдалося зберегти маршрут'

      Alert.alert(
        'Помилка',
        Array.isArray(message) ? message.join(', ') : message,
      )
    }
  }

  const hasUploadingImages = draftImages.some(
    (image) => image.status === 'uploading',
  )

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
            Деталі маршруту
          </AppText>
          <AppText variant='body' color={colors.textSecondary}>
            Перевірте та доповніть інформацію про ваш маршрут
          </AppText>
        </View>

        <RouteDraftSummary routeDraft={routeDraft} difficulty={difficulty} />

        <DraftImagesField
          routeDraftId={routeDraft.id}
          draftImages={draftImages}
          setDraftImages={setDraftImages}
        />

        <RouteMetadataFields control={control} errors={errors} />
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title='Зберегти маршрут'
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
