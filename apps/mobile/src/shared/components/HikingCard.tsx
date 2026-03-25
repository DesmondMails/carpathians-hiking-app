import React from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'

type HikingCardProps = {
  title: string
  location: string
  distanceKm: number
  elevationGainM: number
  duration: string
  level: string
  levelProgress: number
  levelColor?: string
  rating: number
  imageUri: string
  mapUri?: string
  isPopular?: boolean
  isFavorite?: boolean
  onFavoritePress?: () => void
  style?: StyleProp<ViewStyle>
}

export function HikingCard({
  title,
  location,
  distanceKm,
  elevationGainM,
  duration,
  level,
  levelProgress,
  levelColor = '#e94d94',
  rating,
  imageUri,
  mapUri,
  isPopular = false,
  isFavorite = false,
  onFavoritePress,
  style,
}: HikingCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit='cover'
        />

        <View style={styles.badgesRow}>
          {isPopular && (
            <View style={styles.popularBadge}>
              <AppText variant='bodyMedium' style={styles.popularText}>
                Популярний
              </AppText>
            </View>
          )}
          <TouchableOpacity
            style={styles.favBadge}
            onPress={onFavoritePress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#e94d94' : colors.black}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.imageOverlay}>
          {/* Simulated bottom-to-top gradient via layered views */}
          {[0.01, 0.05, 0.11, 0.19, 0.28, 0.38, 0.49, 0.58].map(
            (opacity, i) => (
              <View
                key={i}
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: `rgba(12,12,12,${opacity})`,
                    top: `${i * 12.5}%`,
                  },
                ]}
              />
            ),
          )}
          <View style={styles.routeInfo}>
            <AppText
              variant='title'
              style={styles.routeTitle}
              numberOfLines={1}
            >
              {title}
            </AppText>
            <View style={styles.locationRow}>
              <Ionicons
                name='location-outline'
                size={15}
                color={colors.white}
              />
              <AppText variant='bodyMedium' style={styles.locationText}>
                {location}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsColumn}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <AppText variant='bodyMedium' style={styles.statValue}>
                {distanceKm}
              </AppText>
              <AppText variant='caption' style={styles.statLabel}>
                Відстань
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant='bodyMedium' style={styles.statValue}>
                {elevationGainM}
              </AppText>
              <AppText variant='caption' style={styles.statLabel}>
                Набір
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant='bodyMedium' style={styles.statValue}>
                {duration}
              </AppText>
              <AppText variant='caption' style={styles.statLabel}>
                Тривалість
              </AppText>
            </View>
          </View>

          <View style={styles.levelRatingRow}>
            <View style={styles.levelContainer}>
              <View style={styles.levelBarTrack}>
                <View
                  style={[
                    styles.levelBarFill,
                    {
                      width: `${Math.min(Math.max(levelProgress, 0), 1) * 100}%`,
                      backgroundColor: levelColor,
                    },
                  ]}
                />
              </View>
              <AppText variant='caption' style={styles.statLabel}>
                {level}
              </AppText>
            </View>

            <View style={styles.ratingContainer}>
              <View style={styles.ratingRow}>
                <AppText variant='bodyMedium' style={styles.statValue}>
                  {rating.toFixed(1)}
                </AppText>
                <Ionicons name='star' size={16} color='#f59e0b' />
              </View>
              <AppText variant='caption' style={styles.statLabel}>
                Рейтинг
              </AppText>
            </View>
          </View>
        </View>

        {mapUri && (
          <View style={styles.mapContainer}>
            <Image
              source={{ uri: mapUri }}
              style={styles.mapImage}
              contentFit='contain'
            />
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 32,
    padding: 20,
    gap: 20,
    shadowColor: '#3e3e3e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },

  imageContainer: {
    height: 220,
    borderRadius: 22,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  badgesRow: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  popularBadge: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 200,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  popularText: {
    color: '#1f1f1f',
    fontSize: 13,
  },
  favBadge: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 200,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  routeInfo: {
    gap: 3,
  },
  routeTitle: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    opacity: 0.9,
  },
  locationText: {
    color: colors.white,
    fontSize: 13,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsColumn: {
    flex: 1,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    gap: 2,
  },
  statValue: {
    color: '#1f1f1f',
    fontSize: 15,
    fontWeight: '600',
  },
  statLabel: {
    color: '#7a7a7a',
    fontSize: 12,
  },

  // Level bar
  levelRatingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  levelContainer: {
    gap: 6,
    flex: 1,
    maxWidth: 120,
  },
  levelBarTrack: {
    height: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 200,
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    borderRadius: 200,
  },

  // Rating
  ratingContainer: {
    gap: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  // Map
  mapContainer: {
    width: 110,
    height: 110,
    borderRadius: 20,
    backgroundColor: 'rgba(94,94,94,0.06)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
})
