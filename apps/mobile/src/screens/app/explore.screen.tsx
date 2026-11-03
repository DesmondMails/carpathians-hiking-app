import { useCallback, useEffect, useRef, useState } from 'react'

import { StyleSheet, View } from 'react-native'

import { BottomSheetModal } from '@gorhom/bottom-sheet'
import type { RouteListItem } from '@hiking/shared'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  AllRouteCard,
  CategoryChips,
  FiltersBottomSheet,
  RoutesEmptyState,
  RoutesListFooter,
  RoutesRefreshStatus,
} from '@/src/features/explore/components'
import { EXPLORE_CATEGORIES } from '@/src/features/explore/data/mock-routes'
import { useExplore } from '@/src/features/explore/hooks/useExplore'
import { toSearchPayload } from '@/src/features/explore/mappers/search.payload'
import type { SearchFormValues } from '@/src/features/explore/schemas/search.schema'
import { AppSearch, RoutesLoader } from '@/src/shared/components'
import { useDebounce, useUserLocation } from '@/src/shared/hooks'

export default function ExploreScreen() {
  const userLocation = useUserLocation()
  const {
    routes,
    isRefreshing,
    isLoadingMore,
    hasLoaded,
    refreshError,
    loadMoreError,
    appliedFilters,
    appliedSearchPayload,
    applyFilters,
    loadRoutes,
    loadMore,
    applySearchText,
    retryRefresh,
    retryLoadMore,
  } = useExplore()
  const [searchText, setSearchText] = useState(
    appliedSearchPayload?.searchText ?? ''
  )
  const [activeCategory, setActiveCategory] = useState('Поруч')
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const sheetRef = useRef<BottomSheetModal>(null)
  const listRef = useRef<FlashListRef<RouteListItem>>(null)

  const debouncedSearchText = useDebounce<string>(searchText, 500)

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

  const handleSearchText = (newText: string) => {
    setSearchText(newText)
  }

  const showFirstPageWhenLoaded = useCallback(
    async (request: Promise<boolean>) => {
      if (await request) {
        listRef.current?.scrollToOffset({ offset: 0, animated: false })
      }
    },
    []
  )

  const handleApplyFilters = (filters: SearchFormValues) => {
    void showFirstPageWhenLoaded(
      applyFilters(filters, toSearchPayload(filters, userLocation.location))
    )
  }

  const handleRetryRefresh = () => {
    void showFirstPageWhenLoaded(retryRefresh())
  }

  useEffect(() => {
    void showFirstPageWhenLoaded(applySearchText(debouncedSearchText))
  }, [debouncedSearchText, applySearchText, showFirstPageWhenLoaded])

  useEffect(() => {
    void loadRoutes()
  }, [loadRoutes])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* <ExploreHeader name='Mykyta' location='Карпати' /> */}

      <AppSearch
        text={searchText}
        placeholder='Пошук маршрутів, локацій'
        preIconName='search'
        postIconName='sliders'
        onFilterPress={handleOpenSheet}
        onTextChange={handleSearchText}
      />

      <View style={styles.categoryChips}>
        <CategoryChips
          categories={EXPLORE_CATEGORIES}
          active={activeCategory}
          onPress={setActiveCategory}
        />
      </View>

      {!hasLoaded ? (
        <View style={styles.loader}>
          {refreshError ? (
            <RoutesListFooter
              isLoading={false}
              error={refreshError}
              onRetry={handleRetryRefresh}
            />
          ) : (
            <RoutesLoader />
          )}
        </View>
      ) : (
        <>
          <RoutesRefreshStatus
            isRefreshing={isRefreshing}
            hasError={refreshError != null}
            onRetry={handleRetryRefresh}
          />
          <FlashList
            ref={listRef}
            data={routes}
            extraData={saved}
            maintainVisibleContentPosition={{ disabled: true }}
            ListEmptyComponent={<RoutesEmptyState />}
            ListFooterComponent={
              <RoutesListFooter
                isLoading={isLoadingMore}
                error={loadMoreError}
                onRetry={() => {
                  void retryLoadMore()
                }}
              />
            }
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            onEndReached={() => {
              void loadMore()
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
        </>
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
