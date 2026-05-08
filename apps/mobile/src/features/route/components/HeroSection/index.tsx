import { useEffect, useMemo, useState } from 'react'

import { StyleSheet, View } from 'react-native'

import type { RouteDetails } from '@hiking/shared'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { MapLibrePreview } from '@/src/features/map/components/MapLibrePreview'
import { HERO_HEIGHT } from '@/src/features/route/constants'
import { colors } from '@/src/theme/colors'

import { ModeSwitcher, PhotosView } from './components'

type HeroMode = 'map' | 'photos'

interface HeroSectionProps {
  route: RouteDetails
}

export function HeroSection({ route }: HeroSectionProps) {
  const [mode, setMode] = useState<HeroMode>('map')

  const { top } = useSafeAreaInsets()

  const totalHeight = HERO_HEIGHT + top

  const photosCount = useMemo(
    () => route.imageUrls?.length ?? 0,
    [route.imageUrls],
  )

  useEffect(() => {
    const isPhotoViewWithoutImages = photosCount === 0 && mode === 'photos'

    if (isPhotoViewWithoutImages) setMode('map')
  }, [photosCount, mode])

  return (
    <View style={[styles.container, { height: totalHeight }]}>
      {mode === 'map' ? (
        <MapLibrePreview
          poiMarkers={route.poiMarkers}
          routeCoordinates={route.routeCoordinates}
        />
      ) : (
        <PhotosView imageUrls={route.imageUrls ?? []} height={totalHeight} />
      )}

      {photosCount > 0 && (
        <ModeSwitcher mode={mode} setMode={setMode} photosCount={photosCount} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.primaryDark,
  },
})
