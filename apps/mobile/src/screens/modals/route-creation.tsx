import { useState } from 'react'

import { View, StyleSheet, Pressable } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCreateRoute } from '@/src/features/route-creation/hooks/useCreateRoute'
import { AppButton, AppInput, AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'

export default function RouteCreationScreen() {
  const { createRoute, isLoading } = useCreateRoute()

  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const insets = useSafeAreaInsets()

  const handleCreateRoute = async () => {
    const { id: routeId } = await createRoute({ title, description })
    router.dismissAll()

    router.push(`/routes/${routeId}`)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.controls}>
        <Pressable onPress={() => router.back()}>
          <Feather name='arrow-left' size={24} color={colors.primary} />
        </Pressable>
        <AppText>Створити маршрут</AppText>
      </View>

      <View style={styles.content}>
        <AppInput
          placeholder='Введіть назву маршруту'
          value={title}
          onChangeText={setTitle}
        />
        <AppInput
          placeholder='Введіть опис маршруту'
          value={description}
          onChangeText={setDescription}
        />
      </View>
      <AppButton
        title='Створити маршрут'
        disabled={isLoading}
        onPress={handleCreateRoute}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.white,
    paddingBottom: 22,
    paddingHorizontal: 14,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  content: {
    flex: 1,
    gap: 10,
    paddingTop: 10,
  },
})
