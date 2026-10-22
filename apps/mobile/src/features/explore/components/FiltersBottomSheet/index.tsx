import { FC, RefObject, useMemo } from 'react'

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
import { useExplore } from '../../hooks/useExplore'
import { toSearchPayload } from '../../mappers/search.payload'
import { searchFormSchema, SearchFormValues } from '../../schemas/search.schema'

type FiltersBottomSheetProps = {
  sheetRef: RefObject<BottomSheetModal | null>
  userLocation: ReturnType<typeof useUserLocation>
}

export const FiltersBottomSheet: FC<FiltersBottomSheetProps> = ({
  sheetRef,
  userLocation,
}) => {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(
    () => [Math.min(760 + insets.bottom, (height - insets.top) * 0.92)],
    [height, insets.top, insets.bottom],
  )

  const { isLoading: isLoadingRoutes, loadRoutes } = useExplore()

  const { location, isLoading } = userLocation
  const locationAvailable = !!location && !isLoading

  const { control, reset, handleSubmit } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  })

  const onSubmit = async (searchForm: SearchFormValues) => {
    const payload = toSearchPayload(searchForm)
    const success = await loadRoutes(payload)
    if (success) sheetRef.current?.close()
  }

  const onReset = async () => {
    const success = await loadRoutes({})
    if (success) {
      reset(DEFAULT_FORM_VALUES)
      sheetRef.current?.close()
    }
  }

  return (
    <BottomSheet
      title='Фільтри'
      ref={sheetRef}
      snapPoints={snapPoints}
      enableContentPanningGesture={false}
      footer={
        <BottomControllers
          isLoadingRoutes={isLoadingRoutes}
          onReset={() => onReset()}
          onApply={handleSubmit(onSubmit, (errors) =>
            console.log('errors', errors),
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
                locationAvailable={locationAvailable}
                isLoading={isLoading}
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
