import { FC, useState } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'
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

import { DiffBadge } from '../../explore/components/DiffBadge'
import { MetaChip } from '../../explore/components/MetaChip'
import { RouteCoverPlaceholder } from '../../explore/components/RouteCoverPlaceholder'
import { SaveButton } from '../../explore/components/SaveButton'
import { useNearbyCardWidth } from '../hooks/useNearbyCardWidth'

interface NearbyCardProps {
  route: RouteListItem
  saved?: boolean
}

export const NearbyCard: FC<NearbyCardProps> = ({ route, saved }) => {
  const [coverFailed, setCoverFailed] = useState(false)

  const router = useRouter()

  const saveRoute = useSharedSavedRouteStore((s) => s.saveRoute)
  const unsaveRoute = useSharedSavedRouteStore((s) => s.unsaveRoute)

  const showCover = !!route.coverImageUrl && !coverFailed

  const cardWidth = useNearbyCardWidth()

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
    <Pressable
      style={[styles.card, { width: cardWidth }]}
      onPress={handleCardPress}
    >
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
        </View>
        <View style={styles.saveWrap}>
          <SaveButton saved={!!saved} onPress={handleSaveClick} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <MetaChip icon='map' label={formatDistance(route.distanceM)} />
          <MetaChip
            icon='trending-up'
            label={formatElevation(route.elevationGainM)}
          />
          <MetaChip icon='clock' label={formatDuration(route.durationH)} />
        </View>
        <View style={styles.bottomRow}>
          {route.difficulty ? (
            <DiffBadge difficulty={route.difficulty} />
          ) : null}
          <View style={styles.ratingRow}>
            <Ionicons name='star' size={12} color='#f59e0b' />
            <AppText style={styles.ratingText}>
              {formatRating(route.rating, route.reviewCount)}
            </AppText>
          </View>
        </View>
        {route.region ? (
          <View style={styles.regionRow}>
            <Ionicons
              name='location-outline'
              size={11}
              color={colors.primary}
            />
            <AppText style={styles.regionText} numberOfLines={1}>
              {route.region}
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    height: '100%',
  },
  imageWrap: {
    height: 130,
    width: '100%',
    backgroundColor: colors.primaryLight,
  },
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
  body: { padding: 10, flex: 1, gap: 6 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  bottomRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  ratingText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: colors.textPrimary,
  },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regionText: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 11,
    color: colors.primary,
    maxWidth: '80%',
  },
})
