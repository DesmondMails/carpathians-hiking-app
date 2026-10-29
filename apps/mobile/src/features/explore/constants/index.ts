import { Platform } from 'react-native'

import { LocationStatus } from '@/src/shared/hooks'

import type { SearchFormValues } from '../schemas/search.schema'

export const MIN_DISTANCE_KM = 0
export const MAX_DISTANCE_KM = 50
export const MIN_NEAR_DISTANCE_KM = 1
export const MAX_NEAR_DISTANCE_KM = 200

export const RATING_OPTIONS = [
  { value: null, label: 'Будь-який' },
  { value: 4, label: '★ 4.0+' },
  { value: 4.5, label: '★ 4.5+' },
]

export const ELEVATION_OPTIONS = [
  { value: null, label: 'Без обмежень' },
  { value: 300, label: 'До 300 м' },
  { value: 900, label: 'До 900 м' },
  { value: 1500, label: 'До 1 500 м' },
  { value: 2300, label: 'До 2 300 м' },
]
export const DURATION_OPTIONS = [
  { value: null, label: 'Без обмежень' },
  { value: 3, label: 'До 3 годин' },
  { value: 8, label: 'До 8 годин' },
  { value: 12, label: 'До 12 годин' },
]

export const DEFAULT_FORM_VALUES: SearchFormValues = {
  difficulty: [],
  length: [MIN_DISTANCE_KM, MAX_DISTANCE_KM],
  nearMe: false,
  radius: 50,
  minRating: null,
  maxElevationGainM: null,
  maxDurationH: null,
}

export const TO_METERS_MULTIPLIER = 1000

export const locationHints: Record<
  LocationStatus,
  { text: string; action?: string }
> = {
  loading: { text: 'Визначаємо місцезнаходження…' },
  available: { text: 'Радіус по прямій, не шлях автомобілем' },
  'permission-required': {
    text: 'Дозвольте доступ до геолокації, щоб знайти маршрути поруч.',
    action: 'Дозволити геолокацію',
  },
  'permission-blocked': {
    text:
      Platform.OS === 'web'
        ? 'Дозвольте геолокацію в налаштуваннях сайту у браузері.'
        : 'Дозвольте доступ до геолокації в налаштуваннях застосунку.',
    action:
      Platform.OS === 'web' ? 'Перевірити знову' : 'Відкрити налаштування',
  },
  'services-disabled': {
    text:
      Platform.OS === 'ios'
        ? 'Увімкніть Служби локації: Налаштування → Приватність і безпека → Служби локації.'
        : 'Увімкніть геолокацію в налаштуваннях пристрою.',
    action:
      Platform.OS === 'android' ? 'Відкрити налаштування' : 'Перевірити знову',
  },
  error: {
    text: 'Не вдалося визначити місцезнаходження.',
    action: 'Спробувати ще раз',
  },
}
