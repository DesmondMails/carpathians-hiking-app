import { Dispatch, FC, SetStateAction, useEffect } from 'react'

import { View, StyleSheet } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { POI_COLOR, POI_ICON, POI_LABEL } from '@/src/features/map/constants'
import { PoiMarker } from '@/src/features/route/types'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'



interface SelectedPoiProps {
  selectedPoi: PoiMarker
  setSelectedPoi: Dispatch<SetStateAction<PoiMarker | null>>
}

export const SelectedPoi: FC<SelectedPoiProps> = ({
  selectedPoi,
  setSelectedPoi,
}) => {
  useEffect(() => {
    setTimeout(() => {
      setSelectedPoi(null)
    }, 1500)
  }, [setSelectedPoi])

  return (
    <View style={styles.callout}>
      <View
        style={[
          styles.calloutIcon,
          { backgroundColor: POI_COLOR[selectedPoi.type] },
        ]}
      >
        <Feather
          name={POI_ICON[selectedPoi.type] as any}
          size={12}
          color='#fff'
        />
      </View>
      <View style={styles.calloutBody}>
        <AppText style={styles.calloutType}>
          {POI_LABEL[selectedPoi.type]}
        </AppText>
        <AppText style={styles.calloutName}>{selectedPoi.label}</AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  callout: {
    position: 'absolute',
    bottom: 46,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.transparentDark,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    width: '40%',
  },
  calloutIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutBody: {
    flex: 1,
    gap: 1,
  },
  calloutType: {
    fontSize: 10,
    fontFamily: typography.bodyMedium.fontFamily,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calloutName: {
    fontSize: 13,
    fontFamily: typography.bodyMedium.fontFamily,
    color: '#fff',
  },
})
