import { FC, RefObject, useCallback, useMemo } from 'react'

import { useWindowDimensions } from 'react-native'

import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BottomSheet } from '@/src/shared/components'
import type { useUserLocation } from '@/src/shared/hooks'

import { BottomControllers } from './BottomControllers'
import { DifficultyFilter } from './DifficultyFilter'
import { DistanceWrapper } from './DistanceWrapper'
import { MoreFilters } from './MoreFilters'
import { NearDistance } from './NearDistance'
import { RatingFilter } from './RatingFilter'
import { DEFAULT_FORM_VALUES } from '../../constants'
import { searchFormSchema, SearchFormValues } from '../../schemas/search.schema'

type FiltersBottomSheetProps = {
  sheetRef: RefObject<BottomSheetModal | null>
  userLocation: ReturnType<typeof useUserLocation>
  appliedFilters: SearchFormValues
  onApply: (filters: SearchFormValues) => void
}

export const FiltersBottomSheet: FC<FiltersBottomSheetProps> = ({
  sheetRef,
  userLocation,
  appliedFilters,
  onApply,
}) => {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(
    () => [Math.min(760 + insets.bottom, (height - insets.top) * 0.92)],
    [height, insets.top, insets.bottom]
  )

  const { control, reset, handleSubmit } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: appliedFilters,
  })

  // Sync on open, not on dismiss: the sheet captures its close callbacks when
  // the close animation starts, so a dismiss handler sees pre-apply props.
  const handleAnimate = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === -1 && toIndex >= 0) reset(appliedFilters)
    },
    [appliedFilters, reset]
  )

  const onSubmit = (searchForm: SearchFormValues) => {
    onApply(searchForm)

    sheetRef.current?.dismiss()
  }

  const onReset = () => onSubmit(DEFAULT_FORM_VALUES)

  return (
    <BottomSheet
      title='Фільтри'
      ref={sheetRef}
      snapPoints={snapPoints}
      enableContentPanningGesture={false}
      onAnimate={handleAnimate}
      footer={
        <BottomControllers
          onReset={() => onReset()}
          onApply={handleSubmit(onSubmit, (errors) =>
            console.log('errors', errors)
          )}
        />
      }
    >
      <Controller
        name='difficulty'
        control={control}
        render={({ field: { onChange, value } }) => (
          <DifficultyFilter value={value} onChange={onChange} />
        )}
      />

      <Controller
        name='length'
        control={control}
        render={({ field: { onChange, value } }) => (
          <DistanceWrapper value={value} onChange={onChange} />
        )}
      />

      <Controller
        name='nearMe'
        control={control}
        render={({ field: nearMeField }) => (
          <Controller
            name='radius'
            control={control}
            render={({ field: { onChange, value } }) => (
              <NearDistance
                value={value}
                onChange={onChange}
                nearMe={nearMeField.value}
                onNearMeChange={nearMeField.onChange}
                locationStatus={userLocation.status}
                onRecoverLocation={userLocation.recoverLocation}
              />
            )}
          />
        )}
      />

      <Controller
        name='minRating'
        control={control}
        render={({ field: { onChange, value } }) => (
          <RatingFilter value={value} onChange={onChange} />
        )}
      />

      <MoreFilters control={control} />
    </BottomSheet>
  )
}
