import { z } from 'zod'

import { emailSchema, passwordSchema } from './register.schema'

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type LoginFormValues = z.infer<typeof loginSchema>
