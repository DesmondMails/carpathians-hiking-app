import { FC, useRef, useCallback, useState } from 'react'

import { View, StyleSheet, Platform } from 'react-native'

import RNMapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps'

import type { PoiMarker } from '@/src/features/route/types'
import { colors } from '@/src/theme/colors'

import { SelectedPoi } from '../SelectedPoi'
import { StartEndPoint, PoiMarkerPin } from './components'
// This component doesn't have usage for now, temporary could be as a preview free version

interface MapPreviewProps {
  poiMarkers: PoiMarker[]
  routeCoordinates: { latitude: number; longitude: number }[]
}

export const MapPreview: FC<MapPreviewProps> = ({
  poiMarkers,
  routeCoordinates,
}) => {
  const mapRef = useRef<RNMapView>(null)
  const [selectedPoi, setSelectedPoi] = useState<PoiMarker | null>(null)

  const fitToRoute = useCallback(() => {
    if (mapRef.current && routeCoordinates.length > 0) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 50, right: 50, bottom: 70, left: 50 },
        animated: false,
      })
    }
  }, [routeCoordinates])

  const startPoint = routeCoordinates[0]
  const endPoint = routeCoordinates[routeCoordinates.length - 1]

  return (
    <View style={StyleSheet.absoluteFill}>
      <RNMapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        mapType={Platform.OS === 'android' ? 'terrain' : 'mutedStandard'}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        showsCompass={false}
        showsScale={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
        onLayout={fitToRoute}
        onMapReady={fitToRoute}
        onPress={() => setSelectedPoi(null)}
      >
        {routeCoordinates.length > 0 && (
          <>
            {/* Route outline (background) */}
            {/* <Polyline
              coordinates={routeCoordinates}
              strokeColor='rgba(0,0,0,0.3)' // або білий для темних карт
              strokeWidth={6}
              lineCap='round'
              lineJoin='round'
            /> */}

            {/* Main route */}
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={colors.primary}
              strokeWidth={3}
              lineCap='round'
              lineJoin='round'
            />
          </>
        )}

        {startPoint && (
          <StartEndPoint coordinate={startPoint} color={colors.primary} />
        )}

        {endPoint && (
          <StartEndPoint coordinate={endPoint} color={colors.warning} />
        )}

        {poiMarkers.map((poi) => (
          <PoiMarkerPin
            key={poi.id}
            poi={poi}
            selectedPoi={selectedPoi}
            setSelectedPoi={setSelectedPoi}
          />
        ))}
      </RNMapView>

      {selectedPoi && (
        <SelectedPoi
          selectedPoi={selectedPoi}
          setSelectedPoi={setSelectedPoi}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({})
