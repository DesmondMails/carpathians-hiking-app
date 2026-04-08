import { ElevationPoint } from '../../../types'

export const smoothElevationPath = (
  points: { x: number; y: number }[],
): string => {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  const pts = padForSpline(points)
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

export const cumulativeGainM = (data: ElevationPoint[]): number => {
  let gain = 0
  for (let i = 1; i < data.length; i++) {
    const d = data[i].elevationM - data[i - 1].elevationM
    if (d > 0) gain += d
  }
  return Math.round(gain)
}

export const padForSpline = (
  points: { x: number; y: number }[],
): { x: number; y: number }[] => {
  if (points.length < 2) return points
  return [points[0], ...points, points[points.length - 1]]
}

export const formatKmLabel = (km: number): string => {
  const v = Math.round(km * 10) / 10
  return Number.isInteger(v) ? `${v}` : v.toFixed(1)
}
