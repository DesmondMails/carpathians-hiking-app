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

  const { location, isLoading } = userLocation
  const locationAvailable = !!location && !isLoading

  const { control, reset, handleSubmit } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      length: [5, 30],
      nearMe: false,
      radius: 50,
      minRating: null,
      maxElevationGainM: null,
      maxDurationH: null,
    },
  })

  const onSubmit = async (searchForm: SearchFormValues) => {
    const nearMe = searchForm.nearMe && locationAvailable
    console.log('Form values', {
      ...searchForm,
      nearMe,
      radius: nearMe ? searchForm.radius : undefined,
    })
  }

  return (
    <BottomSheet
      title='Фільтри'
      ref={sheetRef}
      snapPoints={snapPoints}
      enableContentPanningGesture={false}
      footer={
        <BottomControllers
          onReset={() => reset()}
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
