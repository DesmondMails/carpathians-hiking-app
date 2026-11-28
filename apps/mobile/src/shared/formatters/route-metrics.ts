type MaybeNumber = number | null | undefined

export const NO_VALUE = 'н/д'

// One decimal without a trailing zero: 1.25 -> "1.3", 12.0 -> "12"
const oneDecimal = (value: number): string => String(Number(value.toFixed(1)))

const formatMeters = (meters: number): string => {
  const rounded = Math.round(meters)

  return rounded < 1000 ? `${rounded} м` : `${oneDecimal(meters / 1000)} км`
}

/** 850 -> "850 м", 1250 -> "1.3 км" */
export const formatDistance = (distanceM: MaybeNumber): string =>
  distanceM == null ? NO_VALUE : formatMeters(distanceM)

/** Elevation gain, same rules as distance: 920 -> "920 м", 1480 -> "1.5 км" */
export const formatElevation = (elevationM: MaybeNumber): string =>
  elevationM == null ? NO_VALUE : formatMeters(elevationM)

/** 0.75 -> "45 хв", 45.43 -> "45.4 год" */
export const formatDuration = (durationH: MaybeNumber): string => {
  if (durationH == null) {
    return NO_VALUE
  }

  const minutes = Math.round(durationH * 60)

  return minutes < 60 ? `${minutes} хв` : `${oneDecimal(durationH)} год`
}

/** 4.72 -> "4.7"; a route without reviews has no rating yet */
export const formatRating = (
  rating: MaybeNumber,
  reviewCount?: MaybeNumber,
): string => {
  if (rating == null || reviewCount === 0) {
    return NO_VALUE
  }

  return rating.toFixed(1)
}
