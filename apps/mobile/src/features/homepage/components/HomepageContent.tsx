import { ScrollView, StyleSheet, View } from 'react-native'

import { HomeKindWithList } from '@hiking/shared'
import { useRouter } from 'expo-router'

import {
  NearbyCard,
  RecommendedCard,
  SectionHeader,
} from '@/src/features/explore/components'
import { ErrorState } from '@/src/shared/components/ErrorState'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

import { HomepageSkeleton } from './HomepageSkeleton'
import { useHomepage } from '../hooks/useHomepage'

const SECTION_TITLES: Record<HomeKindWithList['kind'], string> = {
  nearby: 'Поруч з вами',
  recent: 'Нещодавно додані',
  ideas: 'Ідеї для походу',
  for_you: 'Рекомендовано для вас',
}

export const HomepageContent = () => {
  const router = useRouter()

  const { homepageData, homepageError, reloadHomePageData } = useHomepage()

  const handleNearMeAllClicked = () => {
    router.push({
      pathname: '/explore',
      params: {
        nearMe: 'true',
      },
    })
  }

  const handleRecentAllClicked = () => {
    router.push('/explore')
  }

  const handleSeeAllPress = () => {
    const isNearMeCarouselKind = homepageData?.carousel.kind === 'nearby'

    return isNearMeCarouselKind
      ? handleNearMeAllClicked()
      : handleRecentAllClicked()
  }

  // Error wins only when there is nothing to show; a failed refresh keeps the old data
  if (!homepageData && homepageError) {
    return (
      <ErrorState
        title='Не вдалось завантажити маршрути'
        description={homepageError}
        onRetry={reloadHomePageData}
      />
    )
  }

  if (!homepageData) {
    return <HomepageSkeleton />
  }

  const { carousel, recommendations } = homepageData

  return (
    <View style={styles.content}>
      {carousel.routes.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader
            title={SECTION_TITLES[carousel.kind]}
            onSeeAll={handleSeeAllPress}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {carousel.routes.map((route) => (
              <NearbyCard key={route.id} route={route} saved={route?.isSaved} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {recommendations.routes.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title={SECTION_TITLES[recommendations.kind]} />
          <View style={styles.vGap}>
            {recommendations.routes.map((route) => (
              <RecommendedCard
                key={route.id}
                route={route}
                saved={route?.isSaved}
              />
            ))}
          </View>
        </View>
      ) : null}
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
