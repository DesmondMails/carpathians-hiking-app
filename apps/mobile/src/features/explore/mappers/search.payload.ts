import { SearchRoutePayload } from '@hiking/shared'

import { SearchFormValues } from '../schemas/search.schema'

export const toSearchPayload = (
  values: SearchFormValues,
): SearchRoutePayload => ({
  difficulty: values.difficulty?.length ? values.difficulty : undefined,
})
