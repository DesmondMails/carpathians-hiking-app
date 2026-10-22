import { useCallback, useEffect, useRef, useState } from 'react'

import { ScrollView, StyleSheet, View } from 'react-native'

import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  AllRouteCard,
  CategoryChips,
  FiltersBottomSheet,
} from '@/src/features/explore/components'
import { EXPLORE_CATEGORIES } from '@/src/features/explore/data/mock-routes'
import { useExplore } from '@/src/features/explore/hooks/useExplore'
import { AppSearch, RoutesLoader } from '@/src/shared/components'
import { useUserLocation } from '@/src/shared/hooks'

export default function ExploreScreen() {
  const userLocation = useUserLocation()
  const { routes, isLoading, loadRoutes } = useExplore()
  const [activeCategory, setActiveCategory] = useState('Поруч')
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const sheetRef = useRef<BottomSheetModal>(null)

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleOpenSheet = useCallback(() => {
    sheetRef.current?.present()
  }, [])

  useEffect(() => {
    void loadRoutes({})
  }, [loadRoutes])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* <ExploreHeader name='Mykyta' location='Карпати' /> */}

      <AppSearch
        placeholder='Пошук маршрутів, локацій'
        preIconName='search'
        postIconName='sliders'
        onFilterPress={handleOpenSheet}
      />

      <View style={styles.categoryChips}>
        <CategoryChips
          categories={EXPLORE_CATEGORIES}
          active={activeCategory}
          onPress={setActiveCategory}
        />
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <RoutesLoader />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.section}>
            {routes.map((route) => (
              <AllRouteCard
                key={route.id}
                route={route}
                saved={saved.has(route.id)}
                onSave={() => toggleSave(route.id)}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <FiltersBottomSheet sheetRef={sheetRef} userLocation={userLocation} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f7f7' },
  scroll: { paddingBottom: 100 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  categoryChips: { marginTop: 12, paddingBottom: 12 },
  section: { marginTop: 12, marginBottom: 24 },
  hScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  vGap: { gap: 12 },
})
