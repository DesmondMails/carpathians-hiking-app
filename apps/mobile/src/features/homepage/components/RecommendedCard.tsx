import { FC } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { Feather, Ionicons } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'
import { Route } from '../../explore/types'
import { BottomGradient } from '../../explore/components/BottomGradient'
import { MetaChip } from '../../explore/components/MetaChip'
import { DiffBadge } from '../../explore/components/DiffBadge'
import { SaveButton } from '../../explore/components/SaveButton'

interface RecommendedCardProps {
  route: Route
  saved: boolean
  onSave: () => void
}

export const RecommendedCard: FC<RecommendedCardProps> = ({
  route,
  saved,
  onSave,
}) => {
  const poi = route.poi

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: route.imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit='cover'
        />
        <BottomGradient height={100} />
        <View style={styles.imageFooter}>
          <AppText style={styles.imageTitle}>{route.title}</AppText>
          <AppText style={styles.imageRegion}>{route.region}</AppText>
        </View>
        <View style={styles.imageSave}>
          <SaveButton saved={saved} onPress={onSave} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <MetaChip icon='map' label={`${route.distanceKm} km`} />
          <View style={styles.dot} />
          <MetaChip icon='trending-up' label={`${route.elevationM} m`} />
          <View style={styles.dot} />
          <MetaChip icon='clock' label={`${route.durationH}h`} />
          <View style={styles.dot} />
          <View style={styles.ratingInline}>
            <Ionicons name='star' size={12} color='#f59e0b' />
            <AppText style={styles.ratingText}>
              {route.rating} ({route.reviewCount})
            </AppText>
          </View>
        </View>

        <View style={styles.diffRow}>
          <DiffBadge difficulty={route.difficulty} />
          <View style={styles.distChip}>
            <Feather name='navigation' size={11} color={colors.primary} />
            <AppText style={styles.distText}>
              {route.distanceFromUserKm} km
            </AppText>
          </View>
        </View>

        {poi && (
          <View style={styles.poiRow}>
            <Feather name='info' size={12} color={colors.gray400} />
            <AppText style={styles.poiText}>
              POI:
              {poi.water ? ` ${poi.water} вода` : ''}
              {poi.shelter ? ` · ${poi.shelter} притулок` : ''}
              {poi.viewpoint ? ` · ${poi.viewpoint} видові` : ''}
            </AppText>
          </View>
        )}

        <View style={styles.ctaRow}>
          <Pressable style={styles.ctaBtn}>
            <Feather name='eye' size={14} color={colors.primary} />
            <AppText style={styles.ctaBtnText}>Перегляд</AppText>
          </Pressable>
          <Pressable style={styles.ctaBtn}>
            <Feather name='download' size={14} color={colors.primary} />
            <AppText style={styles.ctaBtnText}>GPX</AppText>
          </Pressable>
          <Pressable style={styles.ctaBtn}>
            <Feather name='navigation-2' size={14} color={colors.primary} />
            <AppText style={styles.ctaBtnText}>Транспорт</AppText>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  imageWrap: { height: 200, width: '100%' },
  imageFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    gap: 2,
  },
  imageTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 17,
    color: colors.white,
    lineHeight: 22,
  },
  imageRegion: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
  },
  imageSave: { position: 'absolute', top: 12, right: 12 },
  body: { padding: 14, gap: 10 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gray300,
  },
  ratingInline: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: colors.gray500,
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: colors.primary,
  },
  poiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  poiText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: colors.gray500,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    paddingTop: 10,
  },
  ctaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
  },
  ctaBtnText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: colors.primary,
  },
})
