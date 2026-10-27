import { useCallback, useEffect, useRef, useState } from 'react'

import { StyleSheet, View } from 'react-native'

import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  AllRouteCard,
  CategoryChips,
  FiltersBottomSheet,
  RoutesEmptyState,
  RoutesListFooter,
} from '@/src/features/explore/components'
import { EXPLORE_CATEGORIES } from '@/src/features/explore/data/mock-routes'
import { useExplore } from '@/src/features/explore/hooks/useExplore'
import { toSearchPayload } from '@/src/features/explore/mappers/search.payload'
import type { SearchFormValues } from '@/src/features/explore/schemas/search.schema'
import { AppSearch, RoutesLoader } from '@/src/shared/components'
import { useUserLocation } from '@/src/shared/hooks'

export default function ExploreScreen() {
  const userLocation = useUserLocation()
  const {
    routes,
    isLoading,
    isLoadingMore,
    error,
    appliedFilters,
    applyFilters,
    loadRoutes,
    loadMore,
  } = useExplore()
  const [activeCategory, setActiveCategory] = useState('Поруч')
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const sheetRef = useRef<BottomSheetModal>(null)

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleOpenSheet = useCallback(() => {
    sheetRef.current?.present()
  }, [])

  const handleApplyFilters = (filters: SearchFormValues) => {
    void applyFilters(filters, toSearchPayload(filters, userLocation.location))
  }

  useEffect(() => {
    void loadRoutes()
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
        <FlashList
          data={routes}
          extraData={saved}
          ListEmptyComponent={!error ? <RoutesEmptyState /> : null}
          ListFooterComponent={
            <RoutesListFooter
              isLoading={isLoadingMore}
              error={error}
              onRetry={() => {
                void (routes.length ? loadMore() : loadRoutes())
              }}
            />
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (!error) void loadMore()
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <AllRouteCard
              route={item}
              saved={saved.has(item.id)}
              onSave={() => toggleSave(item.id)}
            />
          )}
        />
      )}

      <FiltersBottomSheet
        sheetRef={sheetRef}
        userLocation={userLocation}
        appliedFilters={appliedFilters}
        onApply={handleApplyFilters}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f7f7' },
  list: { paddingBottom: 100 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  categoryChips: { marginTop: 12, paddingBottom: 12 },
  hScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  vGap: { gap: 12 },
})
