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

type UseUserLocationOptions = {
  fetchOnMount?: boolean
}

export const useUserLocation = ({
  fetchOnMount = true,
}: UseUserLocationOptions = {}) => {
  const [location, setLocation] = useState<Location.LocationObject>()
  const [permission, setPermission] =
    useState<Location.LocationPermissionResponse>()
  const [allowLocationError, setAllowLocationError] = useState<Error | null>(
    null,
  )
  const [status, setStatus] = useState<LocationStatus>('loading')
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const locationRequestInFlight = useRef(false)
  const permissionRequestInFlight = useRef(false)

  const requestPermission = useCallback(async () => {
    if (permissionRequestInFlight.current) return false

    permissionRequestInFlight.current = true
    setIsRequestingPermission(true)
    setAllowLocationError(null)

    try {
      let currentPermission = await Location.getForegroundPermissionsAsync()

      if (!currentPermission.granted && currentPermission.canAskAgain) {
        currentPermission = await Location.requestForegroundPermissionsAsync()
      }

      setPermission(currentPermission)

      if (!currentPermission.granted) {
        setStatus(
          currentPermission.canAskAgain
            ? 'permission-required'
            : 'permission-blocked',
        )
      }

      return currentPermission.granted
    } catch (error) {
      setStatus('error')
      setAllowLocationError(
        error instanceof Error
          ? error
          : new Error('Не вдалося запросити доступ до локації.'),
      )
      return false
    } finally {
      permissionRequestInFlight.current = false
      setIsRequestingPermission(false)
    }
  }, [])

  // Checks permission and fetches coordinates when access is already granted.
  // It never opens the system permission dialog.
  const refreshLocation = useCallback(async () => {
    if (locationRequestInFlight.current) return

    locationRequestInFlight.current = true
    setStatus('loading')
    setAllowLocationError(null)
    setLocation(undefined)

    try {
      const currentPermission = await Location.getForegroundPermissionsAsync()
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
      locationRequestInFlight.current = false
    }
  }, [])

  const recoverLocation = useCallback(async () => {
    if (locationRequestInFlight.current || permissionRequestInFlight.current) {
      return
    }

    try {
      if (status === 'permission-blocked' && Platform.OS !== 'web') {
        await Linking.openSettings()
      } else if (status === 'services-disabled' && Platform.OS === 'android') {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS')
      } else {
        const hasPermission = await requestPermission()
        if (hasPermission) await refreshLocation()
      }
    } catch {
      toast.error('Не вдалося відкрити налаштування. Відкрийте їх вручну.')
    }
  }, [requestPermission, refreshLocation, status])

  useEffect(() => {
    if (fetchOnMount) void refreshLocation()

    let previousState = AppState.currentState
    const subscription = AppState.addEventListener('change', (nextState) => {
      // Returning from Settings should recheck permission without another prompt.
      if (
        fetchOnMount &&
        previousState !== 'active' &&
        nextState === 'active'
      ) {
        void refreshLocation()
      }
      previousState = nextState
    })

    return () => {
      subscription.remove()
    }
  }, [fetchOnMount, refreshLocation])

  return {
    location,
    status,
    recoverLocation,
    requestPermission,
    allowedLocationStatus: permission?.status,
    canAskAgain: permission?.canAskAgain,
    allowLocationError,
    isLoading: status === 'loading',
    isRequestingPermission,
    refreshLocation,
  }
}
