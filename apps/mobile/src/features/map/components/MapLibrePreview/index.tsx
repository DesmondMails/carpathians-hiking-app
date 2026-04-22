import { FC, useCallback, useMemo, useRef, useState } from 'react'

import { StyleSheet, View } from 'react-native'

import type { RouteCoordinate, RoutePoi } from '@hiking/shared'
import {
  Camera,
  type CameraRef,
  MapView,
  RasterLayer,
  RasterSource,
  setAccessToken,
} from '@maplibre/maplibre-react-native'

import { SelectedPoi } from '../SelectedPoi'
import { PoiMarkers, RouteLine, StartEndDot } from './components'
import { Coordinate } from '../../types'

// MapLibre with public styles / raster tiles does not require a token
setAccessToken(null)

// Maptiler was used for the default basemap, but it was replaced with OpenTopoMap for better performance and accuracy.
type BasemapType = 'maptilerOutdoor' | 'opentopomap'

interface MapLibrePreviewProps {
  poiMarkers: RoutePoi[]
  routeCoordinates: RouteCoordinate[]
  basemap?: BasemapType
}

const MAPTILER_STYLE_URL =
  'https://api.maptiler.com/maps/outdoor-v4/style.json?key=' +
  process.env.EXPO_PUBLIC_MAPTILER_API_KEY

const EMPTY_STYLE = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background' as const,
      paint: {
        'background-color': '#eef2e6',
      },
    },
  ],
}

export const MapLibrePreview: FC<MapLibrePreviewProps> = ({
  poiMarkers,
  routeCoordinates,
  basemap = 'opentopomap',
}) => {
  const cameraRef = useRef<CameraRef>(null)
  const [selectedPoi, setSelectedPoi] = useState<RoutePoi | null>(null)

  const bounds = useMemo(() => {
    if (!routeCoordinates.length) return null

    const lats = routeCoordinates.map((c) => c.latitude)
    const lons = routeCoordinates.map((c) => c.longitude)

    return {
      ne: [Math.max(...lons), Math.max(...lats)] as Coordinate,
      sw: [Math.min(...lons), Math.min(...lats)] as Coordinate,
    }
  }, [routeCoordinates])

  const handlePoiPress = useCallback(
    (e: { features: GeoJSON.Feature[] }) => {
      const feature = e.features[0]
      if (!feature?.properties) return

      const poi = poiMarkers.find((p) => p.id === feature.properties?.id)
      if (!poi) return

      setSelectedPoi((prev) => (prev?.id === poi.id ? null : poi))
    },
    [poiMarkers],
  )

  const mapStyle = useMemo(() => {
    if (basemap === 'maptilerOutdoor') {
      return MAPTILER_STYLE_URL
    }

    return EMPTY_STYLE
  }, [basemap])

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        style={StyleSheet.absoluteFill}
        mapStyle={mapStyle}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        onPress={() => setSelectedPoi(null)}
      >
        {bounds && (
          <Camera
            ref={cameraRef}
            bounds={{
              ne: bounds.ne,
              sw: bounds.sw,
              paddingTop: 60,
              paddingBottom: 70,
              paddingLeft: 80,
              paddingRight: 80,
            }}
            animationMode='moveTo'
            animationDuration={0}
          />
        )}

        {basemap === 'opentopomap' && (
          <RasterSource
            id='opentopo-source'
            tileSize={256}
            tileUrlTemplates={[
              'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
              'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
              'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
            ]}
          >
            <RasterLayer id='opentopo-layer' />
          </RasterSource>
        )}

        {routeCoordinates.length > 0 && (
          <RouteLine routeCoordinates={routeCoordinates} />
        )}

        <StartEndDot routeCoordinates={routeCoordinates} />

        {poiMarkers.length > 0 && (
          <PoiMarkers
            poiMarkers={poiMarkers}
            selectedPoi={selectedPoi}
            handlePoiPress={handlePoiPress}
          />
        )}
      </MapView>

      {selectedPoi && (
        <SelectedPoi
          selectedPoi={selectedPoi}
          setSelectedPoi={setSelectedPoi}
        />
      )}
    </View>
  )
}
