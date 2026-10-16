import { FC, RefObject, useMemo, useState } from 'react'

import { useWindowDimensions } from 'react-native'

import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BottomSheet } from '@/src/shared/components'

import { BottomControllers } from './BottomControllers'
import { DifficultyFilter } from './DifficultyFilter'
import { DistanceWrapper } from './DistanceWrapper'
import { MoreFilters } from './MoreFilters'
import { NearDistance } from './NearDistance'
import { RatingFilter } from './RatingFilter'
import { searchFormSchema, SearchFormValues } from '../../schemas/search.schema'

type FiltersBottomSheetProps = {
  sheetRef: RefObject<BottomSheetModal | null>
}

export const FiltersBottomSheet: FC<FiltersBottomSheetProps> = ({
  sheetRef,
}) => {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(
    () => [Math.min(760 + insets.bottom, (height - insets.top) * 0.92)],
    [height, insets.top, insets.bottom],
  )

  const { control, reset, handleSubmit } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      length: [5, 30],
      minRating: null,
      maxElevationGainM: null,
      maxDurationH: null,
    },
  })

  const [nearEnabled, setNearEnabled] = useState(false)

  const onSubmit = async (searchForm: SearchFormValues) => {
    console.log('Form values', searchForm)
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
        name='radius'
        control={control}
        render={({ field: { onChange, value } }) => (
          <NearDistance
            value={value}
            onChange={onChange}
            enabled={nearEnabled}
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
