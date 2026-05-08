import { StyleSheet, View } from 'react-native'

import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
} from 'react-hook-form'

import { AppInput, AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { DifficultySelector } from './DifficultySelector'
import { RouteMetadataFormValues } from '../schemas/route-metadata.schema'

interface RouteMetadataFieldsProps<T extends FieldValues> {
  control: Control<T>
  errors: FieldErrors<T>
}

const fieldName = <T extends FieldValues>(
  name: keyof RouteMetadataFormValues,
): Path<T> => name as Path<T>

export const RouteMetadataFields = <T extends FieldValues>({
  control,
  errors,
}: RouteMetadataFieldsProps<T>) => {
  return (
    <>
      <Controller
        control={control}
        name={fieldName<T>('title')}
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label='Назва'
            placeholder='Введіть назву маршруту'
            value={String(value ?? '')}
            onChangeText={onChange}
            onBlur={onBlur}
            helperText={errors.title?.message as string | undefined}
            status={errors.title ? 'error' : 'default'}
          />
        )}
      />

      <Controller
        control={control}
        name={fieldName<T>('region')}
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label='Старт Маршруту'
            placeholder='Введіть назву населеного пункту, де починається маршрут'
            value={String(value ?? '')}
            onChangeText={onChange}
            onBlur={onBlur}
            helperText={errors.region?.message as string | undefined}
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
          name={fieldName<T>('difficulty')}
          render={({ field: { value, onChange } }) => (
            <DifficultySelector value={value} onChange={onChange} />
          )}
        />
      </View>

      <Controller
        control={control}
        name={fieldName<T>('description')}
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label='Опис'
            placeholder='Короткий опис маршруту'
            value={String(value ?? '')}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            helperText={errors.description?.message as string | undefined}
            status={errors.description ? 'error' : 'default'}
          />
        )}
      />
    </>
  )
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
})
