import { FC } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { RouteListItem } from '@hiking/shared'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

import { DiffBadge } from './DiffBadge'
import { MetaChip } from './MetaChip'
import { SaveButton } from './SaveButton'

interface AllRouteCardProps {
  route: RouteListItem
  saved: boolean
  onSave: () => void
}

export const AllRouteCard: FC<AllRouteCardProps> = ({
  route,
  saved,
  onSave,
}) => {
  const router = useRouter()

  const handleCardClick = () => {
    router.navigate({
      pathname: '/routes/[id]',
      params: { id: route.id },
    })
  }

  return (
    <Pressable onPress={handleCardClick} style={styles.card}>
      <View style={styles.thumb}>
        {
          <Image
            source={{ uri: route?.coverImageUrl ? route?.coverImageUrl : '' }}
            style={StyleSheet.absoluteFill}
            contentFit='cover'
          />
        }
        {/* <BottomGradient height={50} /> */}
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <AppText style={styles.title} numberOfLines={1}>
              {route.title}
            </AppText>
            <AppText style={styles.region}>{route.region}</AppText>
          </View>
          <SaveButton saved={saved} onPress={onSave} />
        </View>
        <View style={styles.metaRow}>
          <MetaChip
            icon='map'
            label={
              route?.distanceM
                ? `${Number(route?.distanceM / 1000).toFixed(1)} km`
                : ''
            }
          />
          <View style={styles.dot} />
          <MetaChip
            icon='trending-up'
            label={route?.elevationGainM ? `${route?.elevationGainM} m` : ''}
          />
          <View style={styles.dot} />
          <MetaChip icon='clock' label={`${route.durationH}h`} />
        </View>
        <View style={styles.bottomRow}>
          {route.difficulty ? (
            <DiffBadge difficulty={route.difficulty} />
          ) : null}
          <View style={styles.ratingRow}>
            <Ionicons name='star' size={12} color='#f59e0b' />
            <AppText style={styles.ratingText}>
              {/* {route.rating} · {route.reviewCount} відгуків */}
              Дороби відгуки
            </AppText>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  thumb: { width: 100, height: '100%', objectFit: 'contain' },
  body: { flex: 1, padding: 12, gap: 6 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  titleWrap: { flex: 1 },
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gray300,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 11,
    color: colors.gray500,
  },
})
