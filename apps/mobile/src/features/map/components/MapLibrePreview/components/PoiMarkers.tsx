import { FC, useCallback } from 'react'

import { View, StyleSheet } from 'react-native'

import { Feather } from '@expo/vector-icons'
import type { RoutePoi } from '@hiking/shared'
import { PointAnnotation } from '@maplibre/maplibre-react-native'

import { colors } from '@/src/theme/colors'

import { POI_COLOR, POI_ICON } from '../../../constants'

interface PoiMarkersProps {
  poiMarkers: RoutePoi[]
  selectedPoi: RoutePoi | null
  handlePoiPress: (e: { features: GeoJSON.Feature[] }) => void
}

export const PoiMarkers: FC<PoiMarkersProps> = ({
  poiMarkers,
  selectedPoi,
  handlePoiPress,
}) => {
  const makeFeature = useCallback(
    (poi: RoutePoi): GeoJSON.Feature => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [poi.longitude, poi.latitude],
      },
      properties: { id: poi.id, type: poi.type, label: poi.label },
    }),
    [],
  )

  return (
    <>
      {poiMarkers.map((poi) => {
        const isSelected = selectedPoi?.id === poi.id
        return (
          <PointAnnotation
            key={poi.id}
            id={`poi-${poi.id}`}
            coordinate={[poi.longitude, poi.latitude]}
            onSelected={() => handlePoiPress({ features: [makeFeature(poi)] })}
          >
            <View
              style={[
                styles.poiPin,
                {
                  backgroundColor: POI_COLOR[poi.type] ?? colors.primary,
                  borderColor: isSelected
                    ? colors.textWhite
                    : colors.textLightGray,
                  transform: [{ scale: isSelected ? 1.2 : 1 }],
                },
              ]}
            >
              <Feather
                name={POI_ICON[poi.type] as any}
                size={8}
                color={colors.textWhite}
              />
            </View>
          </PointAnnotation>
        )
      })}
    </>
  )
}

const styles = StyleSheet.create({
  poiPin: {
    width: 18,
    height: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
})
