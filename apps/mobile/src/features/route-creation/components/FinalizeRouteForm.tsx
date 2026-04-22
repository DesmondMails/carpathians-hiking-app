import { FC } from 'react'

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import {
  DIFFICULTY_VALUES,
  FinalizeRouteDraftPayload,
  RouteDraft,
} from '@hiking/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { AppButton, AppInput, AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { DifficultySelector } from './DifficultySelector'
import { RouteDraftSummary } from './RouteDraftSummary'
import {
  FinalizeRouteFormValues,
  finalizeRouteSchema,
} from '../schemas/finalize-route.schema'

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
      difficulty: DIFFICULTY_VALUES[0],
      coveringImageUrl: '',
      notes: '',
    },
  })

  const submit = async (values: FinalizeRouteFormValues) => {
    try {
      await onSubmit({
        title: values.title.trim(),
        description: trimToUndefined(values.description),
        region: trimToUndefined(values.region),
        difficulty: values.difficulty,
        coveringImageUrl: trimToUndefined(values.coveringImageUrl),
        notes: trimToUndefined(values.notes),
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

        <RouteDraftSummary routeDraft={routeDraft} />

        <Controller
          control={control}
          name='title'
          render={({ field: { value, onChange, onBlur } }) => (
            <AppInput
              label='Назва'
              placeholder='Введіть назву маршруту'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              helperText={errors.title?.message}
              status={errors.title ? 'error' : 'default'}
            />
          )}
        />

        <Controller
          control={control}
          name='region'
          render={({ field: { value, onChange, onBlur } }) => (
            <AppInput
              label='Регіон'
              placeholder='Наприклад, Карпати'
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              helperText={errors.region?.message}
              status={errors.region ? 'error' : 'default'}
            />
          )}
        />

        <View style={styles.field}>
          <AppText variant='bodyMedium' color={colors.textPrimary}>
            Складність
          </AppText>
          <Controller
            control={control}
            name='difficulty'
            render={({ field: { value, onChange } }) => (
              <DifficultySelector value={value} onChange={onChange} />
            )}
          />
        </View>

        <Controller
          control={control}
          name='description'
          render={({ field: { value, onChange, onBlur } }) => (
            <AppInput
              label='Опис'
              placeholder='Короткий опис маршруту'
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              helperText={errors.description?.message}
              status={errors.description ? 'error' : 'default'}
            />
          )}
        />

        <Controller
          control={control}
          name='notes'
          render={({ field: { value, onChange, onBlur } }) => (
            <AppInput
              label='Нотатки'
              placeholder='Поради та застереження'
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              style={styles.textArea}
              helperText={errors.notes?.message}
              status={errors.notes ? 'error' : 'default'}
            />
          )}
        />
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title='Зберегти маршрут'
          onPress={handleSubmit(submit)}
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
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
  field: {
    gap: spacing.sm,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  footer: {
    paddingTop: spacing.md,
  },
})
