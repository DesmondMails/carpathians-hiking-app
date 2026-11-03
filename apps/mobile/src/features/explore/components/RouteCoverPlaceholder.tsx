import { StyleSheet, View } from 'react-native'

import Svg, { Path } from 'react-native-svg'

import { colors } from '@/src/theme/colors'

// A single sculpted summit, drawn for the narrow cover. Bottom-aligned
// cropping keeps the mountain grounded without stretching its proportions.
export function RouteCoverPlaceholder() {
  return (
    <View
      style={styles.container}
      pointerEvents='none'
      accessibilityElementsHidden
      importantForAccessibility='no-hide-descendants'
    >
      <Svg
        width='100%'
        height='100%'
        viewBox='0 0 100 120'
        preserveAspectRatio='xMidYMax slice'
      >
        {/* A quiet distant ridge behind the main summit. */}
        <Path
          d='M0 81 C6 80 10 74 16 74 C23 74 29 78 36 77 L48 120 H0 Z'
          fill={colors.primary}
          fillOpacity={0.16}
        />
        {/* Broad lit face with a gently asymmetric peak. */}
        <Path
          d='M0 98 C12 89 22 81 32 71 C38 65 44 65 49 59 C52 56 53 52 55 51 C58 50 61 49 63 48.8 C65 48.5 67 54 69 56 C72 59 76 59 78 63 C81 69 84 72 89 75 C93 77 97 78 100 80 V120 H0 Z'
          fill={colors.primary}
          fillOpacity={0.72}
        />
        {/* The curved ridge separates the two faces without an outline. */}
        <Path
          d='M63 48.8 C65 48.5 67 54 69 56 C72 59 76 59 78 63 C81 69 84 72 89 75 C93 77 97 78 100 80 V120 H0 V113 C13 105 24 96 36 88 C47 81 64 76 68 65 C71 59 64 58 63.5 55 C63.2 53 63.5 50 63 48.8 Z'
          fill={colors.primaryDark}
          fillOpacity={0.68}
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryLight,
  },
})
