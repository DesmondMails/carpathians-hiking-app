import { useMemo } from 'react'

import { View, StyleSheet } from 'react-native'

import { FinalizeRouteDraftPayload } from '@hiking/shared'
import { useLocalSearchParams, useRouter } from 'expo-router'

import {
  CreateRouteModalWrapper,
  FinalizeRouteForm,
} from '@/src/features/route-creation/components'
import { useCreateRoute } from '@/src/features/route-creation/hooks/useCreateRoute'
import { AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'

export default function RoutesCreationFinalizeScreen() {
  const router = useRouter()
  const { draftId } = useLocalSearchParams<{ draftId?: string }>()
  const { routeDraft, isFinalizing, finalizeRoute } = useCreateRoute()

  const activeDraft = useMemo(() => {
    if (!routeDraft) {
      return null
    }

    if (draftId && routeDraft.id !== draftId) {
      return null
    }

    return routeDraft
  }, [draftId, routeDraft])

  const handleSubmit = async (payload: FinalizeRouteDraftPayload) => {
    if (!activeDraft) {
      return
    }

    const route = await finalizeRoute(activeDraft.id, payload)

    router.replace({
      pathname: '/(app)/routes/[id]',
      params: { id: route.id },
    })
  }

  return (
    <CreateRouteModalWrapper showBack>
      {activeDraft ? (
        <FinalizeRouteForm
          routeDraft={activeDraft}
          isSubmitting={isFinalizing}
          onSubmit={handleSubmit}
        />
      ) : (
        <View style={styles.empty}>
          <AppText variant='body' color={colors.textSecondary}>
            Draft маршруту не знайдено. Поверніться та завантажте GPX-файл ще
            раз.
          </AppText>
        </View>
      )}
    </CreateRouteModalWrapper>
  )
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
