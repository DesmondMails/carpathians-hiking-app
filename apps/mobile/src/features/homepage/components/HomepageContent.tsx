import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'
import {
  NearbyCard,
  RecommendedCard,
  SectionHeader,
} from '@/src/features/explore/components'
import {
  NEARBY_ROUTES,
  POPULAR_ROUTES,
  RECOMMENDED_ROUTES,
} from '@/src/features/explore/data/mock-routes'
import { useHomepage } from '../hooks/useHomepage'
import { PopularRow } from './PopularRow'
import { WeekendCard } from './WeekendCard'
import { useRouter } from 'expo-router'

export const HomepageContent = () => {
  const router = useRouter()
  const { routes } = useHomepage()

  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [savedPopular, setSavedPopular] = useState<Set<string>>(new Set())

  const handleSeeAllPress = () => {
    router.push('/explore')
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const togglePopular = (id: string) => {
    setSavedPopular((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <View style={styles.content}>
      <View style={styles.section}>
        <SectionHeader title='Поруч з вами' onSeeAll={handleSeeAllPress} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {NEARBY_ROUTES.map((route) => (
            <NearbyCard
              key={route.id}
              route={route}
              saved={favorites.has(route.id)}
              onSave={() => toggleFavorite(route.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title='Рекомендовано для вас'
          onSeeAll={handleSeeAllPress}
        />
        <View style={styles.vGap}>
          {RECOMMENDED_ROUTES.map((route) => (
            <RecommendedCard
              key={route.id}
              route={route}
              saved={favorites.has(route.id)}
              onSave={() => toggleFavorite(route.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title='Ідеї на вихідні' />
        <WeekendCard />
      </View>

      {/* Popular this week */}
      <View style={styles.section}>
        <SectionHeader
          title='Популярне цього тижня'
          onSeeAll={handleSeeAllPress}
        />
        {POPULAR_ROUTES.map((route, i) => (
          <PopularRow
            key={route.id}
            route={route}
            rank={i + 1}
            saved={savedPopular.has(route.id)}
            onSave={() => togglePopular(route.id)}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
  },
  sectionTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 22,
    lineHeight: 30,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    marginTop: 8,
    marginBottom: 24,
  },
  hScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  vGap: {
    gap: 16,
  },
})
