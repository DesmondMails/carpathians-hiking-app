import { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'
import { Route } from '../../explore/types'
import { BottomGradient } from '../../explore/components/BottomGradient'
import { MetaChip } from '../../explore/components/MetaChip'
import { DiffBadge } from '../../explore/components/DiffBadge'
import { SaveButton } from '../../explore/components/SaveButton'

interface NearbyCardProps {
  route: Route
  saved: boolean
  onSave: () => void
}

export const NearbyCard: FC<NearbyCardProps> = ({ route, saved, onSave }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: route.imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit='cover'
        />
        <BottomGradient height={80} />
        <View style={styles.imageFooter}>
          <AppText style={styles.imageTitle} numberOfLines={2}>
            {route.title}
          </AppText>
        </View>
        <View style={styles.saveWrap}>
          <SaveButton saved={saved} onPress={onSave} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <MetaChip icon='map' label={`${route.distanceKm} km`} />
          <MetaChip icon='trending-up' label={`${route.elevationM} m`} />
          <MetaChip icon='clock' label={`${route.durationH}h`} />
        </View>
        <View style={styles.bottomRow}>
          <DiffBadge difficulty={route.difficulty} />
          <View style={styles.ratingRow}>
            <Ionicons name='star' size={12} color='#f59e0b' />
            <AppText style={styles.ratingText}>{route.rating}</AppText>
          </View>
        </View>
        <View style={styles.distRow}>
          <Ionicons name='navigate-outline' size={11} color={colors.primary} />
          <AppText style={styles.distText}>
            {route.distanceFromUserKm} km від вас
          </AppText>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 190,
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageWrap: { height: 130, width: '100%' },
  imageFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  imageTitle: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: colors.white,
    lineHeight: 16,
  },
  saveWrap: { position: 'absolute', top: 8, right: 8 },
  body: { padding: 10, gap: 6 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: colors.textPrimary,
  },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 11,
    color: colors.primary,
  },
})
