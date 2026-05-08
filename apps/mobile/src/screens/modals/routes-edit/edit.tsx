import { useEffect, useState } from 'react'

import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { EditableRoute, UpdateRoutePayload } from '@hiking/shared'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { routeEditApi } from '@/src/features/route/api/route-edit.api'
import { EditRouteForm } from '@/src/features/route/components'
import { useRoute } from '@/src/features/route/hooks/useRoute'
import { CreateRouteModalWrapper } from '@/src/features/route-creation/components'
import { AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'

export default function RouteEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const router = useRouter()
  const { loadRoute } = useRoute()

  const [route, setRoute] = useState<EditableRoute | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    router.dismiss()
  }

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    const loadEditableRoute = async () => {
      setIsLoading(true)

      try {
        const editableRoute = await routeEditApi.getEditableRoute(id)
        setRoute(editableRoute)
      } finally {
        setIsLoading(false)
      }
    }

    loadEditableRoute()
  }, [id])

  const handleSubmit = async (payload: UpdateRoutePayload) => {
    if (!id) {
      return
    }

    setIsSubmitting(true)

    try {
      await routeEditApi.updateRoute(id, payload)
      await loadRoute(id)
      router.back()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CreateRouteModalWrapper showBack onClose={handleClose}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : route ? (
        <EditRouteForm
          route={route}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      ) : (
        <View style={styles.centered}>
          <AppText variant='body' color={colors.textSecondary}>
            Маршрут для редагування не знайдено.
          </AppText>
        </View>
      )}
    </CreateRouteModalWrapper>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
