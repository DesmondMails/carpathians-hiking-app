import { useState } from 'react'

import { ScrollView, StyleSheet, View } from 'react-native'

import { useLocalSearchParams } from 'expo-router'

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
import { MOCK_ROUTE_DETAILS } from '@/src/features/route/data/mock-route'
import { colors } from '@/src/theme/colors'

export default function RouteScreen() {
  useLocalSearchParams<{ id: string }>()
  const [saved, setSaved] = useState(false)
  const [scrollEnabled, setScrollEnabled] = useState(true)

  // In production: fetch by params.id — using mock for MVP
  const route = MOCK_ROUTE_DETAILS

  const handleSave = () => setSaved((v) => !v)
  const handleShare = () => {
    /* TODO: Share.share */
  }
  const handleDownloadGpx = () => {
    /* TODO: download / open file */
  }
  const handleOpenExternal = () => {
    /* TODO: Linking.openURL to OsmAnd / Mapy deeplink */
  }

  return (
    <View style={styles.root}>
      <ControlsTop saved={saved} onSave={handleSave} onShare={handleShare} />

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
              totalDistanceKm={route.distanceKm}
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

      {/* Floating CTA bar */}
      <PrimaryActions
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
