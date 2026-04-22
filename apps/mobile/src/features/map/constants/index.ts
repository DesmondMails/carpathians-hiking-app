import type { RoutePoiType } from '@hiking/shared'

export const POI_COLOR: Record<RoutePoiType, string> = {
  WATER: '#3b82f6',
  SHELTER: '#f59e0b',
  VIEWPOINT: '#8b5cf6',
  PEAK: '#ef4444',
}

export const POI_ICON: Record<RoutePoiType, string> = {
  WATER: 'droplet',
  SHELTER: 'home',
  VIEWPOINT: 'eye',
  PEAK: 'triangle',
}

export const POI_LABEL: Record<RoutePoiType, string> = {
  WATER: 'Вода',
  SHELTER: 'Прихисток',
  VIEWPOINT: 'Оглядовий майданчик',
  PEAK: 'Вершина',
}
