import { ScrollView, StyleSheet, View } from 'react-native'
import {
  HomapageHero,
  HomepageContent,
} from '@/src/features/homepage/components'
import { useHomepage } from '@/src/features/homepage/hooks/useHomepage'
import { useEffect } from 'react'
import { AppSearch } from '@/src/shared/components/AppSearch'
import { useRouter } from 'expo-router'

export default function HomepageScreen() {
  const { loadFavoriteRoutes } = useHomepage()

  const router = useRouter()

  const handleSearchPress = () => {
    router.push('/explore')
  }

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

        <AppSearch
          placeholder='Відкрийте для себе нову пригоду'
          preIconName='search'
          postIconName='sliders'
          onSearchPress={handleSearchPress}
        />

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
