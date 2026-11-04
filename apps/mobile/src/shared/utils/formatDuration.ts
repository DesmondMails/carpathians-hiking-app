export const formatDuration = (durationH: number): string => {
  const hours = Math.floor(durationH)
  const mins = Math.round((durationH - hours) * 60)

  if (hours === 0) {
    return `${mins}хв`
  }

  return mins > 0 ? `${hours}г ${mins}хв` : `${hours}г`
}
