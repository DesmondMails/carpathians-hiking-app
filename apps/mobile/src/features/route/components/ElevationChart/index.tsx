import { FC, useCallback, useId, useMemo, useState } from 'react'

import {
  LayoutChangeEvent,
  StyleSheet,
  View,
  GestureResponderEvent,
} from 'react-native'

import * as Haptics from 'expo-haptics'
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'
import { fontFamily, typography } from '@/src/theme/typography'

import { PointerLabel } from './components'
import { cumulativeGainM, formatKmLabel, smoothElevationPath } from './utils'
import type { ElevationPoint } from '../../types'

const LINE_COLOR = '#2a8f68'
const GRADIENT_TOP = 'rgba(42, 143, 104, 0.42)'

const CHART_PAD_TOP = 10
const CHART_PAD_BOTTOM = 26
const CHART_INNER_HEIGHT = 118
const CHART_SVG_HEIGHT = CHART_PAD_TOP + CHART_INNER_HEIGHT + CHART_PAD_BOTTOM
const CARD_RADIUS = 14
const AXIS_PAD_H = 4

export interface ElevationChartProps {
  data: ElevationPoint[]
  elevationGainM?: number
  totalDistanceKm?: number
  title?: string | false
  onInteractionStart?: () => void
  onInteractionEnd?: () => void
}

export const ElevationChart: FC<ElevationChartProps> = ({
  data,
  elevationGainM: gainProp,
  totalDistanceKm,
  title,
  onInteractionStart,
  onInteractionEnd,
}) => {
  const [chartWidth, setChartWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const gradientId = useId().replace(/:/g, '')

  const minEl = useMemo(
    () => Math.min(...data.map((p) => p.elevationM)),
    [data],
  )
  const maxEl = useMemo(
    () => Math.max(...data.map((p) => p.elevationM)),
    [data],
  )
  const endKm = totalDistanceKm ?? data[data.length - 1]?.distanceKm ?? 0
  const gainM = gainProp ?? cumulativeGainM(data)

  const yRange = Math.max(maxEl - minEl, 1)
  const yPad = yRange * 0.08

  const pixelGeometry = useMemo(() => {
    if (chartWidth <= 0 || data.length < 2) return null
    const innerW = chartWidth - AXIS_PAD_H * 2
    const maxDist = Math.max(data[data.length - 1].distanceKm, 0.0001)
    const yTop = CHART_PAD_TOP
    const yBottom = CHART_PAD_TOP + CHART_INNER_HEIGHT

    const toXY = (p: ElevationPoint) => {
      const x = AXIS_PAD_H + (p.distanceKm / maxDist) * innerW
      const t = (p.elevationM - minEl + yPad) / (yRange + yPad * 2)
      const y = yBottom - t * (yBottom - yTop)
      return { x, y }
    }

    const pts = data.map(toXY)
    const lineD = smoothElevationPath(pts)
    const bottomY = CHART_PAD_TOP + CHART_INNER_HEIGHT
    const areaD = `${lineD} L ${pts[pts.length - 1].x} ${bottomY} L ${pts[0].x} ${bottomY} Z`

    return { pts, lineD, areaD, maxDist, bottomY }
  }, [chartWidth, data, minEl, yRange, yPad])

  const onChartLayout = useCallback((e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width)
  }, [])

  const indexFromX = useCallback(
    (locationX: number) => {
      if (!pixelGeometry || data.length < 2) return null
      const { pts, maxDist } = pixelGeometry
      const innerW = chartWidth - AXIS_PAD_H * 2
      const clamped = Math.max(
        AXIS_PAD_H,
        Math.min(locationX, chartWidth - AXIS_PAD_H),
      )
      const distKm = ((clamped - AXIS_PAD_H) / innerW) * maxDist

      let best = 0
      let bestD = Infinity
      for (let i = 0; i < data.length; i++) {
        const d = Math.abs(data[i].distanceKm - distKm)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
      return { index: best, px: pts[best] }
    },
    [pixelGeometry, chartWidth, data],
  )

  const handleTouchStart = (e: GestureResponderEvent) => {
    onInteractionStart?.()
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const hit = indexFromX(e.nativeEvent.locationX)
    if (hit) setActiveIndex(hit.index)
  }

  const handleTouchMove = (e: GestureResponderEvent) => {
    const hit = indexFromX(e.nativeEvent.locationX)
    if (hit) setActiveIndex(hit.index)
  }

  const handleTouchEnd = () => {
    setActiveIndex(null)
    onInteractionEnd?.()
  }

  if (data.length < 2) {
    return null
  }

  const activePoint =
    activeIndex != null && pixelGeometry ? pixelGeometry.pts[activeIndex] : null
  const activeSample = activeIndex != null ? data[activeIndex] : null

  const heading =
    title === false ? null : typeof title === 'string' ? title : 'Висота'

  return (
    <View style={styles.card}>
      {heading ? <AppText style={styles.title}>{heading}</AppText> : null}

      <View
        style={styles.chartBlock}
        onLayout={onChartLayout}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {chartWidth > 0 && pixelGeometry ? (
          <Svg
            width={chartWidth}
            height={CHART_SVG_HEIGHT}
            pointerEvents='none'
          >
            <Defs>
              <LinearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                <Stop offset='0' stopColor={GRADIENT_TOP} stopOpacity={1} />
                <Stop offset='1' stopColor={GRADIENT_TOP} stopOpacity={0} />
              </LinearGradient>
            </Defs>

            <Path
              d={pixelGeometry.areaD}
              fill={`url(#${gradientId})`}
              stroke='none'
            />
            <Path
              d={pixelGeometry.lineD}
              fill='none'
              stroke={LINE_COLOR}
              strokeWidth={2.5}
              strokeLinecap='round'
              strokeLinejoin='round'
            />

            {activePoint && activeSample ? (
              <>
                <Line
                  x1={activePoint.x}
                  y1={CHART_PAD_TOP}
                  x2={activePoint.x}
                  y2={pixelGeometry.bottomY}
                  stroke={colors.primaryDark}
                  strokeWidth={1}
                  strokeDasharray='4 4'
                  opacity={0.45}
                />
                <Circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r={6}
                  fill={colors.surface}
                  stroke={LINE_COLOR}
                  strokeWidth={2.5}
                />
              </>
            ) : null}
          </Svg>
        ) : null}

        {activePoint && activeSample ? (
          <View
            style={[
              styles.tooltipWrap,
              {
                left: Math.min(
                  Math.max(activePoint.x - 36, 0),
                  chartWidth - 72,
                ),
                top: Math.max(activePoint.y - 52, 0),
              },
            ]}
            pointerEvents='none'
          >
            <PointerLabel
              value={activeSample.elevationM}
              distanceKm={activeSample.distanceKm}
            />
          </View>
        ) : null}

        <View style={styles.axisRow} pointerEvents='none'>
          <AppText style={styles.axisText}>0 км</AppText>
          <AppText style={styles.axisText}>{formatKmLabel(endKm)} км</AppText>
        </View>
      </View>

      <View style={styles.statsRow}>
        <AppText style={styles.statGain}>↑ {gainM} м</AppText>
        <AppText style={styles.statSep}> • </AppText>
        <AppText style={styles.statPeak}>Пік {Math.round(maxEl)} м</AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: typography.title.fontFamily,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  chartBlock: {
    position: 'relative',
  },
  axisRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: AXIS_PAD_H,
  },
  axisText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
  },
  tooltipWrap: {
    position: 'absolute',
    width: 72,
    zIndex: 2,
  },
  statsRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  statGain: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  statSep: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textDisabled,
  },
  statPeak: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
})
