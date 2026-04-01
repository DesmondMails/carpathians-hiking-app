import { colors } from '@/src/theme/colors'

import { Difficulty } from '../types'

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Легкий: '#22c55e',
  Помірний: '#f59e0b',
  Складний: '#e94d94',
  Екстрем: '#ef4444',
}

export const getDifficultyColor = (d: Difficulty) => {
  return DIFFICULTY_COLOR[d] ?? colors.primary
}
