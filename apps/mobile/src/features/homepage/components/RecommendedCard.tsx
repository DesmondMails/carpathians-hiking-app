import { FC, useState } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { Feather, Ionicons } from '@expo/vector-icons'
import { RouteListItem } from '@hiking/shared'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import { AppText } from '@/src/shared/components/AppText'
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatRating,
} from '@/src/shared/formatters'
import { useSharedSavedRouteStore } from '@/src/shared/store/saved-shared.store'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

import { BottomGradient } from '../../explore/components/BottomGradient'
import { DiffBadge } from '../../explore/components/DiffBadge'
import { MetaChip } from '../../explore/components/MetaChip'
import { RouteCoverPlaceholder } from '../../explore/components/RouteCoverPlaceholder'
import { SaveButton } from '../../explore/components/SaveButton'

// TODO: mocks until RouteListItem gets rating, POI counts and distance to user
const MOCK_RATING = { rating: 4.7, reviewCount: 12 }
const MOCK_POI = { water: 2, shelter: 1, viewpoint: 3 }
const MOCK_DISTANCE_FROM_USER_M = 12400

interface RecommendedCardProps {
  route: RouteListItem
  saved?: boolean
}

export const RecommendedCard: FC<RecommendedCardProps> = ({ route, saved }) => {
  const router = useRouter()
  const saveRoute = useSharedSavedRouteStore((s) => s.saveRoute)
  const unsaveRoute = useSharedSavedRouteStore((s) => s.unsaveRoute)

  const [coverFailed, setCoverFailed] = useState(false)
  const showCover = !!route.coverImageUrl && !coverFailed

  const poi = MOCK_POI

  const handleCardPress = () => {
    router.push({
      pathname: '/routes/[id]',
      params: { id: route.id },
    })
  }

  const handleSaveClick = () => {
    if (saved) {
      unsaveRoute(route.id)

      return
    }

    saveRoute(route.id)
  }

  return (
    <Pressable onPress={handleCardPress} style={styles.card}>
      <View style={styles.imageWrap}>
        {showCover ? (
          <Image
            source={{
              uri: route.coverImageUrl!,
              cacheKey: route.coverImageId ?? route.id,
            }}
            style={StyleSheet.absoluteFill}
            contentFit='cover'
            cachePolicy='memory-disk'
            transition={200}
            onError={() => setCoverFailed(true)}
            placeholder={
              route.coverImageThumbhash
                ? { thumbhash: route.coverImageThumbhash }
                : undefined
            }
            placeholderContentFit='cover'
          />
        ) : (
          <RouteCoverPlaceholder />
        )}
        <View style={styles.imageFooter}>
          <AppText style={styles.imageTitle} numberOfLines={2}>
            {route.title}
          </AppText>
          {route.region ? (
            <AppText style={styles.imageRegion} numberOfLines={1}>
              {route.region}
            </AppText>
          ) : null}
        </View>
        <View style={styles.imageSave}>
          <SaveButton saved={!!saved} onPress={handleSaveClick} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <MetaChip icon='map' label={formatDistance(route.distanceM)} />
          <View style={styles.dot} />
          <MetaChip
            icon='trending-up'
            label={formatElevation(route.elevationGainM)}
          />
          <View style={styles.dot} />
          <MetaChip icon='clock' label={formatDuration(route.durationH)} />
          <View style={styles.dot} />
          <View style={styles.ratingInline}>
            <Ionicons name='star' size={12} color='#f59e0b' />
            <AppText style={styles.ratingText}>
              {`${formatRating(MOCK_RATING.rating, MOCK_RATING.reviewCount)} (${MOCK_RATING.reviewCount})`}
            </AppText>
          </View>
        </View>

        <View style={styles.diffRow}>
          {route.difficulty ? (
            <DiffBadge difficulty={route.difficulty} />
          ) : null}
          {/* TODO: Replace with other data, coords could be not present */}
          <View style={styles.distChip}>
            <Feather name='navigation' size={11} color={colors.primary} />
            <AppText style={styles.distText}>
              {formatDistance(MOCK_DISTANCE_FROM_USER_M)}
            </AppText>
          </View>
        </View>

        {poi && (
          //TODO: Replace with real transport data after transport info implementation
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
          <Pressable onPress={handleCardPress} style={styles.ctaBtn}>
            <Feather name='eye' size={14} color={colors.primary} />
            <AppText style={styles.ctaBtnText}>Перегляд</AppText>
          </Pressable>
          <Pressable style={styles.ctaBtn}>
            <Feather name='download' size={14} color={colors.primary} />
            <AppText style={styles.ctaBtnText}>GPX</AppText>
          </Pressable>
        </View>
      </View>
    </Pressable>
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
  imageWrap: {
    height: 200,
    width: '100%',
    backgroundColor: colors.primaryLight,
  },
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
    // Badge height, so cards without a difficulty keep the same height
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
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
