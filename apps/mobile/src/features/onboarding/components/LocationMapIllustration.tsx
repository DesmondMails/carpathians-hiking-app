import { StyleSheet, View } from 'react-native'

import Svg, { Circle, Path } from 'react-native-svg'

const palette = {
  map: '#F8FCFA',
  mapEdge: '#BFDCCF',
  contour: '#D4E9DF',
  route: '#389D75',
  routeStart: '#B8DDCC',
}

export const LocationMapIllustration = () => (
  <View
    accessible
    accessibilityLabel='Мапа з маршрутом і вашою локацією'
    style={styles.container}
  >
    <Svg width='100%' height='100%' viewBox='0 0 240 150'>
      <Path
        d='M28 35 88 20l62 15 62-17v91l-62 17-62-15-60 16V35Z'
        fill={palette.map}
        stroke={palette.mapEdge}
        strokeWidth={3}
        strokeLinejoin='round'
      />
      <Path
        d='m88 20-1 91M150 35v91'
        fill='none'
        stroke={palette.contour}
        strokeWidth={3}
      />
      <Path
        d='M38 53c17-15 31-13 44-4 13 10 20 4 28-5M38 73c17-13 30-11 44-2 11 7 19 3 28-5M161 53c15-13 30-9 43-1M161 75c15-12 29-9 42-2M161 96c13-10 27-7 40-1'
        fill='none'
        stroke={palette.contour}
        strokeWidth={2}
        strokeLinecap='round'
      />
      <Path
        d='M41 101c20 0 24-26 46-26 19 0 18 27 37 27 17 0 20-35 42-35 14 0 18 11 29 11'
        fill='none'
        stroke={palette.route}
        strokeWidth={4}
        strokeLinecap='round'
        strokeDasharray='1 9'
      />
      <Circle
        cx={41}
        cy={101}
        r={7}
        fill={palette.routeStart}
        stroke={palette.route}
        strokeWidth={3}
      />
      <Path
        d='M194 57c-10 0-18 8-18 18 0 13 18 31 18 31s18-18 18-31c0-10-8-18-18-18Z'
        fill={palette.route}
      />
      <Circle cx={194} cy={75} r={6} fill={palette.map} />
    </Svg>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
