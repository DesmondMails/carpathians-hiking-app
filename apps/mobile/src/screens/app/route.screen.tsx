import { useEffect, useState } from 'react'

import { ScrollView, Share, StyleSheet, View } from 'react-native'

import { useLocalSearchParams, useRouter } from 'expo-router'

import { useAuth } from '@/src/features/auth/hooks/useAuth'
import {
  DescriptionBlock,
  ElevationChart,
  ControlsTop,
  HeroSection,
  InfoBlocks,
  PrimaryActions,
  RouteIdentity,
  StatsRow,
} from '@/src/features/route/components'
import { useRoute } from '@/src/features/route/hooks/useRoute'
import { ensureGpxFile, shareGpxFile } from '@/src/features/route/utils/gpxFile'
import { buildRouteLink } from '@/src/features/route/utils/routeLink'
import { toast } from '@/src/shared/store/toast.store'
import { colors } from '@/src/theme/colors'

export default function RouteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { isLoading, route, loadRoute, loadGpxUrl } = useRoute()
  const { user } = useAuth()

  const [saved, setSaved] = useState(false)
  const [scrollEnabled, setScrollEnabled] = useState(true)

  const handleSave = () => setSaved((v) => !v)

  const handleShare = async () => {
    if (!route) return

    const url = buildRouteLink(id)

    try {
      await Share.share({
        title: route.title,
        message: `${route.title}\n${url}`,
        url,
      })
    } catch (error) {
      console.error('Share failed', error)
      toast.error('Не вдалось поділитись маршрутом')
    }
  }

  const gpxFilename = route?.title ?? `route-${id}`

  const handleDownloadGpx = async () => {
    try {
      const file = await ensureGpxFile(gpxFilename, () => loadGpxUrl(id))

      await shareGpxFile(file, 'Збереження GPX файлу')

      toast.success('GPX файл завантажено')
    } catch (error) {
      console.error('GPX download failed', error)
      toast.error('Не вдалось завантажити GPX файл')
    }
  }

  const handleOpenExternal = async () => {
    try {
      const file = await ensureGpxFile(gpxFilename, () => loadGpxUrl(id))
      await shareGpxFile(file, 'Відкрити в додатку для карт')
    } catch (error) {
      console.error('GPX open failed', error)
      toast.error('Не вдалось відкрити GPX файл')
    }
  }

  const handleEdit = () => {
    router.push({
      pathname: '/(modals)/routes/[id]/edit',
      params: { id },
    })
  }

  useEffect(() => {
    if (id) {
      loadRoute(id)
    }
  }, [id, loadRoute])

  if (!route) return null

  const canEdit = route.createdBy.id === user?.id

  return (
    <View style={styles.root}>
      <ControlsTop
        saved={saved}
        onSave={handleSave}
        onShare={handleShare}
        onEdit={canEdit ? handleEdit : undefined}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={scrollEnabled}
        bounces={false}
      >
        <HeroSection route={route} />

        <View style={styles.card}>
          <RouteIdentity route={route} />

          <StatsRow route={route} />

          <View style={styles.section}>
            <ElevationChart
              data={route.elevationProfile}
              elevationGainM={route.elevationGainM}
              totalDistanceM={route.distanceM}
              onInteractionStart={() => setScrollEnabled(false)}
              onInteractionEnd={() => setScrollEnabled(true)}
            />
          </View>

          <View style={styles.section}>
            <DescriptionBlock route={route} />
          </View>

          <View style={styles.section}>
            <InfoBlocks route={route} />
          </View>
        </View>
      </ScrollView>

      <PrimaryActions
        isLoading={isLoading}
        onDownloadGpx={handleDownloadGpx}
        onOpenExternal={handleOpenExternal}
        gpxAvailable={route.gpxAvailable}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 72,
  },
  card: {
    position: 'relative',
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -30,
  },
  section: {
    paddingTop: 4,
  },
  sectionBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
})
