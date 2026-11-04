export const DIFFICULTY_VALUES = [
  'EASY',
  'MODERATE',
  'HARD',
  'EXTREME',
] as const
export type Difficulty = (typeof DIFFICULTY_VALUES)[number]

// Applied to the base walking time (distance + ascent) to get the route duration
export const DIFFICULTY_DURATION_MULTIPLIER: Record<Difficulty, number> = {
  EASY: 1,
  MODERATE: 1.1,
  HARD: 1.25,
  EXTREME: 1.45,
}
