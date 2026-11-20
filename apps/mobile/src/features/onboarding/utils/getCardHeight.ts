// Imported from the file directly: constants/index imports components,
// so going through the barrel would create a circular import.
import {
  CARD_HEIGHT_RATIO,
  CARD_MAX_HEIGHT,
  CARD_MIN_HEIGHT,
} from '../constants/layout'

export const getCardHeight = (windowHeight: number) =>
  Math.min(
    Math.max(windowHeight * CARD_HEIGHT_RATIO, CARD_MIN_HEIGHT),
    CARD_MAX_HEIGHT
  )
