import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AppSearch } from '@/src/shared/components/AppSearch'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

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

      {/* FAB */}
      <View style={styles.fabWrap}>
        <Pressable style={styles.fab}>
          <Feather name='plus' size={20} color={colors.white} />
          <AppText style={styles.fabText}>Маршрут</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f7f7' },
  scroll: { paddingBottom: 120 },
  categoryChips: { marginTop: 12, paddingBottom: 12 },
  section: { marginTop: 12, marginBottom: 24 },
  hScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  vGap: { gap: 12 },
  fabWrap: { position: 'absolute', bottom: 90, right: 20 },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 200,
    paddingHorizontal: 18,
    paddingVertical: 13,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  fabText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: colors.white,
  },
})
