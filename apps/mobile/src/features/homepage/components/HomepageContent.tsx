import { useState } from 'react'
import { AppText } from '@/src/shared/components/AppText'
import { HikingCard } from '@/src/shared/components/HikingCard'
import { StyleSheet, View } from 'react-native'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'
import { HorizontalSelection } from '@/src/shared/components/HorizontalSelection'
import { useHomepage } from '../hooks/useHomepage'

const MAP_URI =
  'https://www.figma.com/api/mcp/asset/d935908b-50c2-45fa-9652-4f7addd76473'

const CATEGORIES = [
  { label: 'Гори', active: true },
  { label: 'Пляжі', active: false },
  { label: 'Ліси', active: false },
  { label: 'Поля', active: false },
  { label: 'Міста', active: false },
]

const TRAILS = [
  {
    id: '1',
    title: 'Vereda do Pico do Arieiro',
    location: 'Santana, Portugal',
    distance: '12.4 km',
    elevation: '840 m',
    duration: '8h 15m',
    level: 'Hard Level',
    levelProgress: 0.71,
    rating: 4.2,
    imageUri:
      'https://www.figma.com/api/mcp/asset/40be9126-5a87-43c4-b31b-0edd4eaddd80',
    mapUri: MAP_URI,
    isPopular: true,
  },
  {
    id: '2',
    title: 'Via ferrata Piccolo Cir',
    location: 'South Tyrol, Italy',
    distance: '4.7 km',
    elevation: '450 m',
    duration: '3h 15m',
    level: 'Moderate Level',
    levelProgress: 0.5,
    levelColor: '#389d75',
    rating: 4.9,
    imageUri:
      'https://www.figma.com/api/mcp/asset/1aa6728d-8e1f-492a-9859-cf385edd57f5',
    mapUri: MAP_URI,
    isPopular: true,
  },
  {
    id: '3',
    title: 'Montana Tafada',
    location: 'Tenerife, Spain',
    distance: '3.9 km',
    elevation: '280 m',
    duration: '2h 15m',
    level: 'Easy Level',
    levelProgress: 0.3,
    levelColor: '#22c55e',
    rating: 5.0,
    imageUri:
      'https://www.figma.com/api/mcp/asset/ba4d91a7-0cb1-4846-841e-07fd8844fb27',
    mapUri: MAP_URI,
    isPopular: false,
  },
]

export const HomepageContent = () => {
  const { routes } = useHomepage()
  const [categories, setCategories] =
    useState<{ label: string; active: boolean }[]>(CATEGORIES)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleCategoryPress = (category: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.label === category) {
          return { ...cat, active: !cat.active }
        }

        return cat
      }),
    )
  }

  return (
    <View style={styles.content}>
      <HorizontalSelection
        items={categories}
        onItemPress={handleCategoryPress}
      />
      <AppText style={styles.sectionTitle}>
        Найкращі маршрути поблизу вас
      </AppText>

      {routes.map((route) => (
        <HikingCard
          key={route.id}
          {...route}
          distanceKm={route.distanceKm ?? 0}
          elevationGainM={route.elevationGainM ?? 0}
          location='Ukraine'
          duration='8h 15m'
          level='Hard Level'
          levelProgress={0.71}
          rating={4.2}
          imageUri='https://www.figma.com/api/mcp/asset/40be9126-5a87-43c4-b31b-0edd4eaddd80'
          mapUri={MAP_URI}
          isFavorite={favorites.has(route.id)}
          onFavoritePress={() => toggleFavorite(route.id)}
          style={styles.card}
        />
      ))}
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
})
