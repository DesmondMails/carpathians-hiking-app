import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AppSearch } from '@/src/shared/components/AppSearch'

import {
  AllRouteCard,
  CategoryChips,
  ExploreHeader,
} from '@/src/features/explore/components'

import {
  ALL_ROUTES,
  EXPLORE_CATEGORIES,
} from '@/src/features/explore/data/mock-routes'

export default function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState('Поруч')
  const [saved, setSaved] = useState<Set<string>>(new Set())

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* <ExploreHeader name='Mykyta' location='Карпати' /> */}

      <AppSearch
        placeholder='Пошук маршрутів, локацій, POI'
        preIconName='search'
        postIconName='sliders'
      />

      <View style={styles.categoryChips}>
        <CategoryChips
          categories={EXPLORE_CATEGORIES}
          active={activeCategory}
          onPress={setActiveCategory}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.section}>
          {ALL_ROUTES.map((route) => (
            <AllRouteCard
              key={route.id}
              route={route}
              saved={saved.has(route.id)}
              onSave={() => toggleSave(route.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f7f7' },
  scroll: { paddingBottom: 100 },
  categoryChips: { marginTop: 12, paddingBottom: 12 },
  section: { marginTop: 12, marginBottom: 24 },
  hScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  vGap: { gap: 12 },
})
