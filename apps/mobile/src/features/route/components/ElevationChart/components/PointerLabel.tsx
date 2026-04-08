import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { fontFamily } from '@/src/theme/typography'

interface PointerLabelProps {
  value: number
  distanceKm: number
}

export const PointerLabel: FC<PointerLabelProps> = ({ value, distanceKm }) => {
  const km =
    distanceKm % 1 === 0 ? `${distanceKm}` : distanceKm.toFixed(1)
  return (
    <View style={styles.card}>
      <AppText style={styles.elevation}>{Math.round(value)} м</AppText>
      <AppText style={styles.distance}>{km} км</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  elevation: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textPrimary,
  },
  distance: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 10,
    lineHeight: 14,
    color: colors.textSecondary,
    marginTop: 1,
  },
})
