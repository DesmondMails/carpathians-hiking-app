import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'

import { MetaChip , SaveButton } from '@/src/features/explore/components'
import { Route } from '@/src/features/explore/types'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

interface PopularRowProps {
  route: Route
  rank: number
  saved: boolean
  onSave: () => void
}

export const PopularRow: FC<PopularRowProps> = ({
  route,
  rank,
  saved,
  onSave,
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.rankWrap}>
        <AppText style={styles.rank}>{String(rank).padStart(2, '0')}</AppText>
      </View>
      <View style={styles.thumb}>
        <Image
          source={{ uri: route.imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit='cover'
        />
      </View>
      <View style={styles.info}>
        <AppText style={styles.title} numberOfLines={1}>
          {route.title}
        </AppText>
        <AppText style={styles.region} numberOfLines={1}>
          {route.region}
        </AppText>
        <View style={styles.meta}>
          <MetaChip icon='map' label={`${route.distanceKm} km`} />
          <MetaChip icon='trending-up' label={`${route.elevationM} m`} />
          <View style={styles.ratingChip}>
            <Ionicons name='star' size={11} color='#f59e0b' />
            <AppText style={styles.ratingText}>{route.rating}</AppText>
          </View>
        </View>
      </View>
      <SaveButton saved={saved} onPress={onSave} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rankWrap: { width: 28, alignItems: 'center' },
  rank: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 15,
    color: colors.gray300,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray100,
  },
  info: { flex: 1, gap: 2 },
  title: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
  },
  region: {
    fontFamily: typography.body.fontFamily,
    fontSize: 11,
    color: colors.gray400,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 11,
    color: colors.gray500,
  },
})
