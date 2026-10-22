export const DIFFICULTY_VALUES = [
  'EASY',
  'MODERATE',
  'HARD',
  'EXTREME',
] as const
export type Difficulty = (typeof DIFFICULTY_VALUES)[number]
