import { DIFFICULTY_VALUES } from '@hiking/shared'
import { z } from 'zod'

export const finalizeRouteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Вкажіть назву маршруту')
    .max(120, 'Назва занадто довга'),
  description: z
    .string()
    .trim()
    .max(2000, 'Опис занадто довгий')
    .optional()
    .or(z.literal('')),
  region: z
    .string()
    .trim()
    .max(120, 'Назва регіону занадто довга')
    .optional()
    .or(z.literal('')),
  difficulty: z.enum(DIFFICULTY_VALUES).optional(),
  notes: z
    .string()
    .trim()
    .max(2000, 'Нотатки занадто довгі')
    .optional()
    .or(z.literal('')),
})

export type FinalizeRouteFormValues = z.infer<typeof finalizeRouteSchema>
