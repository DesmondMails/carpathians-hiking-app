import { DIFFICULTY_VALUES } from '@hiking/shared'
import { z } from 'zod'

import {
  MAX_DISTANCE_KM,
  MAX_NEAR_DISTANCE_KM,
  MIN_DISTANCE_KM,
  MIN_NEAR_DISTANCE_KM,
} from '../constants'

const distanceKm = z.number().min(MIN_DISTANCE_KM).max(MAX_DISTANCE_KM)
const lengthTuple = z
  .tuple([distanceKm, distanceKm])
  .refine(
    ([minimum, maximum]) =>
      maximum - minimum >= 0.1 - Number.EPSILON * MAX_DISTANCE_KM,
    {
      message:
        'Максимальна довжина має перевищувати мінімальну хоча б на 0,1 км',
      path: [1],
    },
  )

export const searchFormSchema = z.object({
  difficulty: z.array(z.enum(DIFFICULTY_VALUES)).optional(),
  length: lengthTuple,
  nearMe: z.boolean(),
  radius: z
    .number()
    .min(MIN_NEAR_DISTANCE_KM)
    .max(MAX_NEAR_DISTANCE_KM)
    .optional(),
  minRating: z.number().positive().max(5).nullable(),
  maxElevationGainM: z.number().positive().nullable(),
  maxDurationH: z.number().positive().nullable(),
})

export type SearchFormValues = z.infer<typeof searchFormSchema>
