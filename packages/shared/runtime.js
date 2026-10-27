// Node loads this file when the API require()s @hiking/shared.
// Keep every public runtime value in sync with its declaration in src/types or src/constants.
const DIFFICULTY_VALUES = ['EASY', 'MODERATE', 'HARD', 'EXTREME']

const DIFFICULTY_LABELS = {
  EASY: 'Легкий',
  MODERATE: 'Помірний',
  HARD: 'Складний',
  EXTREME: 'Екстремальний',
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
  RoutePoiEnrichmentStatusOptions,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
}
