import { useState } from 'react'

import { StyleSheet, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { MapLibrePreview } from '@/src/features/map/components/MapLibrePreview'
import { HERO_HEIGHT } from '@/src/features/route/constants'
import type { RouteDetails } from '@/src/features/route/types'
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
      {/* Content */}
      {mode === 'map' ? (
        <MapLibrePreview
          poiMarkers={route.poiMarkers}
          routeCoordinates={route.routeCoordinates}
        />
      ) : (
        <PhotosView imageUris={route.imageUris} height={totalHeight} />
      )}

      <ModeSwitcher mode={mode} setMode={setMode} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.primaryDark,
  },
})
