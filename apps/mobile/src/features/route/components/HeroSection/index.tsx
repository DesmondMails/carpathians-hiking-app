import { useState } from 'react'

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

      <ModeSwitcher
        mode={mode}
        setMode={setMode}
        photosCount={route.imageUrls?.length ?? 0}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.primaryDark,
  },
})
