export const toFixedNumber = (value: number, precision: number = 1): number => {
  return Number(value.toFixed(precision))
}
