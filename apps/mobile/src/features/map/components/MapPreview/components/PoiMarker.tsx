import { FC, useCallback } from 'react'

import { View, StyleSheet } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { Marker, MarkerPressEvent } from 'react-native-maps'

import type { PoiMarker } from '@/src/features/route/types'
import { colors } from '@/src/theme/colors'

import { POI_COLOR, POI_ICON } from '../../../constants'


interface PoiMarkerProps {
  poi: PoiMarker
  selectedPoi: PoiMarker | null
  setSelectedPoi: (poi: PoiMarker | null) => void
}

export const PoiMarkerPin: FC<PoiMarkerProps> = ({
  poi,
  selectedPoi,
  setSelectedPoi,
}) => {
  const handlePress = useCallback(
    (e: MarkerPressEvent) => {
      e.stopPropagation()
      setSelectedPoi(selectedPoi?.id === poi.id ? null : poi)
    },
    [poi, selectedPoi, setSelectedPoi],
  )

  return (
    <Marker
      coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
      onPress={handlePress}
    >
      <View
        style={[
          styles.poiPin,
          {
            backgroundColor: POI_COLOR[poi.type] ?? colors.primary,
            borderColor:
              selectedPoi?.id === poi.id
                ? colors.textWhite
                : colors.textLightGray,
            transform: [{ scale: selectedPoi?.id === poi.id ? 1.2 : 1 }],
          },
        ]}
      >
        <Feather
          name={POI_ICON[poi.type] as any}
          size={8}
          color={colors.textWhite}
        />
      </View>
    </Marker>
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
