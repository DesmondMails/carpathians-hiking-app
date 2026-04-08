import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { colors } from '@/src/theme/colors'

import type { TransportType } from './types'

interface TransportIconProps {
  type: TransportType
  size?: number
}

const ICON_MAP: Record<
  TransportType,
  keyof typeof Ionicons.glyphMap
> = {
  train: 'train-outline',
  bus: 'bus-outline',
  combo: 'shuffle-outline',
  map: 'map-outline',
}

export const TransportIcon: FC<TransportIconProps> = ({ type, size = 22 }) => {
  const name = ICON_MAP[type]
  return (
    <View style={styles.wrap}>
      <Ionicons name={name} size={size} color={colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
