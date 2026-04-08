import type { StartPoint, TransportOption } from './types'

export const MOCK_TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: '1',
    type: 'train',
    title: 'Потягом',
    subtitle: 'Житомир → Ворохта (~10–12h)',
    steps: [
      'Потягом до Івано-Франківська',
      'Пересадка на місцевий потяг або автобус',
      'Перехід ~10 хв до стартової точки',
    ],
    actionLabel: 'Переглянути розклад',
  },
  {
    id: '2',
    type: 'combo',
    title: 'Потягом + Автобус',
    subtitle: 'Житомир → Івано-Франківськ → Ворохта',
    steps: ['Потягом до Івано-Франківська', 'Автобус до Ворохти'],
  },
]

export const MOCK_START_POINT: StartPoint = {
  lat: 48.155,
  lng: 24.553,
}
