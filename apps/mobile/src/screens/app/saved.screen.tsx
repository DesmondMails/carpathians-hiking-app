import { useEffect } from 'react'

import { StyleSheet, View } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import { SavedList } from '@/src/features/saved/components'
import { useSavedStore } from '@/src/features/saved/store/saved.store'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

export default function SavedScreen() {
  const loadSavedRoutes = useSavedStore((s) => s.loadSavedRoutes)

  useEffect(() => {
    loadSavedRoutes()
  }, [loadSavedRoutes])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppText variant='h1' style={styles.heading} accessibilityRole='header'>
        Збережені
      </AppText>

      <SavedList />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  heading: {
    fontSize: 32,
    lineHeight: 40,
    paddingHorizontal: spacing.xxl,
    paddingTop: 32,
    paddingBottom: spacing.xxl,
  },
})
