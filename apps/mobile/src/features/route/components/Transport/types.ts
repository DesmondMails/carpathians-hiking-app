export type TransportType = 'train' | 'bus' | 'combo' | 'map'

export interface TransportOption {
  id: string
  type: TransportType
  title: string
  subtitle: string
  steps: string[]
  actionLabel?: string
}

export interface StartPoint {
  lat: number
  lng: number
}

export interface TransportSectionProps {
  title?: string
  subtitle?: string
  options: TransportOption[]
  startPoint: StartPoint
  /** Без зовнішніх відступів і заголовка — для вкладок у InfoBlocks */
  embedded?: boolean
}
