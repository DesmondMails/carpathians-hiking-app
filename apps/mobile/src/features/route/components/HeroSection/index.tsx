import { useEffect, useMemo, useState } from 'react'

import { ActivityIndicator, StyleSheet, View } from 'react-native'

import type {
  RouteDetails,
  RoutePoi,
  RoutePoiEnrichmentStatus,
} from '@hiking/shared'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { MapLibrePreview } from '@/src/features/map/components/MapLibrePreview'
import { HERO_HEIGHT } from '@/src/features/route/constants'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'

import { ModeSwitcher, PhotosView } from './components'

type HeroMode = 'map' | 'photos'

interface HeroSectionProps {
  route: RouteDetails
  poiMarkers: RoutePoi[]
  poiStatus: RoutePoiEnrichmentStatus
}

export function HeroSection({ route, poiMarkers, poiStatus }: HeroSectionProps) {
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
        <>
          <MapLibrePreview
            poiMarkers={poiMarkers}
            routeCoordinates={route.routeCoordinates}
          />

          {poiStatus === 'PENDING' && (
            <View style={styles.poiOverlay}>
              <ActivityIndicator color={colors.textWhite} size='small' />
              <AppText style={styles.poiOverlayText}>Шукаємо POI...</AppText>
            </View>
          )}

          {poiStatus === 'FAILED' && (
            <View style={styles.poiOverlay}>
              <AppText style={styles.poiOverlayText}>
                POI тимчасово недоступні
              </AppText>
            </View>
          )}
        </>
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
  poiOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  poiOverlayText: {
    color: colors.textWhite,
    fontSize: 13,
  },
})
