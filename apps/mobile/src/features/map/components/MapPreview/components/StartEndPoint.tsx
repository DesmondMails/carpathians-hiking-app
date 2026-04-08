import { FC } from 'react'

import { View, StyleSheet } from 'react-native'

import { Marker } from 'react-native-maps'

interface StartEndPointProps {
  coordinate: { latitude: number; longitude: number }
  color: string
}

export const StartEndPoint: FC<StartEndPointProps> = ({
  coordinate,
  color,
}) => (
  <Marker
    coordinate={coordinate}
    anchor={{ x: 0.5, y: 0.5 }}
    tracksViewChanges={false}
  >
    <View style={[styles.terminator, { borderColor: color }]}>
      <View style={[styles.terminatorCore, { backgroundColor: color }]} />
    </View>
  </Marker>
)

const styles = StyleSheet.create({
  terminator: {
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  terminatorCore: {
    width: 4,
    height: 4,
    borderRadius: 3,
  },
})
