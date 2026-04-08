import { FC, useMemo } from 'react'

import { LineLayer, ShapeSource } from '@maplibre/maplibre-react-native'

interface RouteLineProps {
  routeCoordinates: { latitude: number; longitude: number }[]
}

export const RouteLine: FC<RouteLineProps> = ({ routeCoordinates }) => {
  const routeGeoJSON = useMemo(
    (): GeoJSON.Feature<GeoJSON.LineString> => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: routeCoordinates.map((c) => [c.longitude, c.latitude]),
      },
      properties: {},
    }),
    [routeCoordinates],
  )

  return (
    <ShapeSource id='route-source' shape={routeGeoJSON}>
      <LineLayer
        id='route-casing'
        style={{
          lineColor: 'rgba(20, 42, 31, 0.55)',
          lineWidth: 4,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      <LineLayer
        id='route-line'
        style={{
          lineColor: '#22C55E',
          lineWidth: 2,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </ShapeSource>
  )
}
