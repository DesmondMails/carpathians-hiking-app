import { useRef } from 'react'

import { StyleSheet } from 'react-native'

import { RouteListItem } from '@hiking/shared'
import { FlashListRef, FlashList } from '@shopify/flash-list'

import { RoutesListFooter } from '@/src/features/explore/components/RoutesListFooter'
import { AllRouteCard, RoutesEmptyState } from '@/src/shared/components'
import { TAB_BAR_HEIGHT } from '@/src/shared/constants'
import { spacing } from '@/src/theme/spacing'

import {
  SAVED_EMPTY_STATE_DESCRIPTION,
  SAVED_EMPTY_STATE_TITLE,
} from '../constants'
import { useSaved } from '../hooks/useSaved'

export const SavedList = () => {
  const { isLoadingMore, loadError, savedRoutes, loadMoreRoutes } = useSaved()

  const listRef = useRef<FlashListRef<RouteListItem>>(null)

  return (
    <>
      <FlashList
        ref={listRef}
        data={savedRoutes}
        maintainVisibleContentPosition={{ disabled: true }}
        ListEmptyComponent={
          <RoutesEmptyState
            titleText={SAVED_EMPTY_STATE_TITLE}
            descriptionText={SAVED_EMPTY_STATE_DESCRIPTION}
          />
        }
        ListFooterComponent={
          <RoutesListFooter
            isLoading={isLoadingMore}
            error={loadError}
            onRetry={loadMoreRoutes}
          />
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (!loadError) loadMoreRoutes()
        }}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <AllRouteCard route={item} saved={item?.isSaved} />
        )}
      />
    </>
  )
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: TAB_BAR_HEIGHT + spacing.xxl,
  },
})
