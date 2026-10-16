import { useCallback, useEffect, useRef, useState } from 'react'

import { AppState } from 'react-native'

import * as Location from 'expo-location'

export const useUserLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject>()
  const [permission, setPermission] =
    useState<Location.LocationPermissionResponse>()
  const [allowLocationError, setAllowLocationError] = useState<Error | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const requestInFlight = useRef(false)

  const refreshLocation = useCallback(async (requestPermission = true) => {
    if (requestInFlight.current) return

    requestInFlight.current = true
    setIsLoading(true)
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
      if (!currentPermission.granted) return

      if (!(await Location.hasServicesEnabledAsync())) {
        throw new Error(
          'Служби геолокації вимкнені. Увімкніть їх у налаштуваннях пристрою.',
        )
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      setLocation(position)
    } catch (error) {
      setAllowLocationError(
        error instanceof Error
          ? error
          : new Error(
              'Не вдалося визначити місцезнаходження. Спробуйте ще раз.',
            ),
      )
    } finally {
      requestInFlight.current = false
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshLocation()

    let previousState = AppState.currentState
    const subscription = AppState.addEventListener('change', (nextState) => {
      // Returning from Settings should recheck permission without another prompt.
      if (previousState === 'background' && nextState === 'active') {
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
    allowedLocationStatus: permission?.status,
    canAskAgain: permission?.canAskAgain,
    allowLocationError,
    isLoading,
    refreshLocation,
  }
}
