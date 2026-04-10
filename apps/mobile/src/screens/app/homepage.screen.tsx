import { useEffect } from 'react'

import { ScrollView, StyleSheet, View } from 'react-native'

import { useRouter } from 'expo-router'

import {
  HomapageHero,
  HomepageContent,
} from '@/src/features/homepage/components'
import { useHomepage } from '@/src/features/homepage/hooks/useHomepage'
import { AppSearch } from '@/src/shared/components/AppSearch'

export default function HomepageScreen() {
  const { loadRoutes } = useHomepage()

  const router = useRouter()

  const handleSearchPress = () => {
    router.push('/explore')
  }

  useEffect(() => {
    loadRoutes()
  }, [loadRoutes])

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
