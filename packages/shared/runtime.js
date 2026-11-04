// Node loads this file when the API require()s @hiking/shared.
// Keep every public runtime value in sync with its declaration in src/types or src/constants.
const DIFFICULTY_VALUES = ['EASY', 'MODERATE', 'HARD', 'EXTREME']

const DIFFICULTY_LABELS = {
  EASY: 'Легкий',
  MODERATE: 'Помірний',
  HARD: 'Складний',
  EXTREME: 'Екстремальний',
}

const DIFFICULTY_DURATION_MULTIPLIER = {
  EASY: 1,
  MODERATE: 1.1,
  HARD: 1.25,
  EXTREME: 1.45,
}

const DEFAULT_LIMIT = 15
const DEFAULT_OFFSET = 0

const RoutePoiEnrichmentStatusOptions = {
  PENDING: 'PENDING',
  READY: 'READY',
  FAILED: 'FAILED',
}

module.exports = {
  DIFFICULTY_VALUES,
  DIFFICULTY_LABELS,
  DIFFICULTY_DURATION_MULTIPLIER,
  RoutePoiEnrichmentStatusOptions,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
}
