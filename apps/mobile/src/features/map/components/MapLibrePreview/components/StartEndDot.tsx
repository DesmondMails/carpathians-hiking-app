import { useMemo, FC } from 'react'

import { CircleLayer, ShapeSource } from '@maplibre/maplibre-react-native'

import { colors } from '@/src/theme/colors'

interface StartEndDotProps {
  routeCoordinates: { latitude: number; longitude: number }[]
}

export const StartEndDot: FC<StartEndDotProps> = ({ routeCoordinates }) => {
  const terminalsGeoJSON = useMemo((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature<GeoJSON.Point>[] = []

    if (routeCoordinates.length > 0) {
      const s = routeCoordinates[0]
      const e = routeCoordinates[routeCoordinates.length - 1]
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.longitude, s.latitude] },
        properties: { role: 'start', color: colors.primary },
      })
      if (routeCoordinates.length > 1) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [e.longitude, e.latitude] },
          properties: { role: 'end', color: colors.warning },
        })
      }
    }
    return { type: 'FeatureCollection', features }
  }, [routeCoordinates])
  return (
    <ShapeSource id='terminals-source' shape={terminalsGeoJSON}>
      <CircleLayer
        id='terminals-ring'
        style={{
          circleRadius: 6,
          circleColor: '#ffffff',
          circleStrokeWidth: 2,
          circleStrokeColor: ['get', 'color'] as any,
        }}
      />
      <CircleLayer
        id='terminals-core'
        style={{
          circleRadius: 3,
          circleColor: ['get', 'color'] as any,
        }}
      />
    </ShapeSource>
  )
}
