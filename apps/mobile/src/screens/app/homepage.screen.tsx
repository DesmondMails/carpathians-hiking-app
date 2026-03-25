import { ScrollView, StyleSheet, View } from 'react-native'
import {
  HomapageHero,
  HomePageSearchBar,
  HomepageContent,
} from '@/src/features/homepage/components'
import { useHomepage } from '@/src/features/homepage/hooks/useHomepage'
import { useEffect } from 'react'

export default function HomepageScreen() {
  const { loadFavoriteRoutes } = useHomepage()

  useEffect(() => {
    loadFavoriteRoutes()
  }, [])

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <HomapageHero />

        <HomePageSearchBar />

        <HomepageContent />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
})
