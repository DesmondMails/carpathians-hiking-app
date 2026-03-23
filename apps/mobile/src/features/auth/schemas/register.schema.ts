import { z } from 'zod'

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email обовʼязковий')
  .email('Введіть валідний email')

export const passwordSchema = z
  .string()
  .min(1, 'Пароль обовʼязковий')
  .min(8, 'Пароль повинен бути не менше 8 символів')

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Підтвердіть ваш пароль'),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'Паролі не збігаються',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
