import { useCallback, useEffect, useRef, useState } from 'react'

import { AppState, Linking, Platform } from 'react-native'

import * as Location from 'expo-location'

import { toast } from '@/src/shared/store/toast.store'

export type LocationStatus =
  | 'loading'
  | 'available'
  | 'permission-required'
  | 'permission-blocked'
  | 'services-disabled'
  | 'error'

export const useUserLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject>()
  const [permission, setPermission] =
    useState<Location.LocationPermissionResponse>()
  const [allowLocationError, setAllowLocationError] = useState<Error | null>(
    null,
  )
  const [status, setStatus] = useState<LocationStatus>('loading')
  const requestInFlight = useRef(false)

  const refreshLocation = useCallback(async (requestPermission = true) => {
    if (requestInFlight.current) return

    requestInFlight.current = true
    setStatus('loading')
    setAllowLocationError(null)
    setLocation(undefined)

    try {
      let currentPermission = await Location.getForegroundPermissionsAsync()

      const shouldRequestPermission =
        !currentPermission.granted &&
        currentPermission.canAskAgain &&
        requestPermission

      if (shouldRequestPermission) {
        currentPermission = await Location.requestForegroundPermissionsAsync()
      }

      setPermission(currentPermission)
      if (!currentPermission.granted) {
        setStatus(
          currentPermission.canAskAgain
            ? 'permission-required'
            : 'permission-blocked',
        )
        return
      }

      if (!(await Location.hasServicesEnabledAsync())) {
        setStatus('services-disabled')
        return
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      setLocation(position)
      setStatus('available')
    } catch (error) {
      setStatus('error')
      setAllowLocationError(
        error instanceof Error
          ? error
          : new Error(
              'Не вдалося визначити місцезнаходження. Спробуйте ще раз.',
            ),
      )
    } finally {
      requestInFlight.current = false
    }
  }, [])

  const recoverLocation = useCallback(async () => {
    if (requestInFlight.current) return

    try {
      if (status === 'permission-blocked' && Platform.OS !== 'web') {
        await Linking.openSettings()
      } else if (status === 'services-disabled' && Platform.OS === 'android') {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS')
      } else {
        await refreshLocation()
      }
    } catch {
      toast.error('Не вдалося відкрити налаштування. Відкрийте їх вручну.')
    }
  }, [status, refreshLocation])

  useEffect(() => {
    void refreshLocation()

    let previousState = AppState.currentState
    const subscription = AppState.addEventListener('change', (nextState) => {
      // Returning from Settings should recheck permission without another prompt.
      if (previousState !== 'active' && nextState === 'active') {
        void refreshLocation(false)
      }
      previousState = nextState
    })

    return () => {
      subscription.remove()
    }
  }, [refreshLocation])

  return {
    location,
    status,
    recoverLocation,
    allowedLocationStatus: permission?.status,
    canAskAgain: permission?.canAskAgain,
    allowLocationError,
    isLoading: status === 'loading',
    refreshLocation,
  }
}
