import { useWindowDimensions } from 'react-native'

const MAX_CARD_WIDTH = 210
const SCREEN_WIDTH_RATIO = 0.48

// Shared by NearbyCard and its skeleton, so both always have the same width
export const useNearbyCardWidth = (): number => {
  const { width } = useWindowDimensions()

  return Math.min(MAX_CARD_WIDTH, Math.round(width * SCREEN_WIDTH_RATIO))
}
