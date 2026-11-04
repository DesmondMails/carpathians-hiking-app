export const formatElevation = (elevationM: number): string => {
  const totalM = Math.round(elevationM)
  const km = Math.floor(totalM / 1000)
  const m = totalM % 1000

  if (km === 0) {
    return `${m} м`
  }

  return m > 0 ? `${km} км ${m} м` : `${km} км`
}
