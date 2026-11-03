import { isSameValue } from '@/src/shared/utils/isSameValue'

import { DEFAULT_FORM_VALUES } from '../constants'
import type { SearchFormValues } from '../schemas/search.schema'

export const hasActiveFilters = (filters: SearchFormValues): boolean =>
  (Object.keys(DEFAULT_FORM_VALUES) as (keyof SearchFormValues)[]).some(
    (key) => {
      // Radius only narrows results when "near me" is on
      if (key === 'radius' && !filters.nearMe) return false
      // The schema allows both [] and undefined for "any difficulty"
      if (key === 'difficulty') return !!filters.difficulty?.length

      return !isSameValue(filters[key], DEFAULT_FORM_VALUES[key])
    }
  )
