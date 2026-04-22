import type { RouteDifficulty } from '@hiking/shared'

import { colors } from '@/src/theme/colors'

const DIFFICULTY_COLOR: Record<RouteDifficulty, string> = {
  EASY: '#22c55e',
  MODERATE: '#f59e0b',
  HARD: '#e94d94',
  EXTREME: '#ef4444',
}

export const getDifficultyColor = (d: RouteDifficulty) => {
  return DIFFICULTY_COLOR[d] ?? colors.primary
}
