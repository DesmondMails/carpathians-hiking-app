import { SearchRoutePayload } from '@hiking/shared'

import {
  MAX_DISTANCE_KM,
  MIN_DISTANCE_KM,
  TO_METERS_MULTIPLIER,
} from '../constants'
import { SearchFormValues } from '../schemas/search.schema'

export const toSearchPayload = (
  values: SearchFormValues,
): SearchRoutePayload => {
  const distanceFromM =
    values.length?.length && values.length[0] !== MIN_DISTANCE_KM
      ? values.length[0] * TO_METERS_MULTIPLIER
      : undefined
  const distanceToM =
    values.length?.length && values.length[1] !== MAX_DISTANCE_KM
      ? values.length[1] * TO_METERS_MULTIPLIER
      : undefined

  return {
    difficulty: values.difficulty?.length ? values.difficulty : undefined,
    distanceFromM,
    distanceToM,
  }
}
