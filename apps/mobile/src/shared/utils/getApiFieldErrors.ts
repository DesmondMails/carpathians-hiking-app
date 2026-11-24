import type { ApiFieldValidationError } from '@hiking/shared'
import { isAxiosError } from 'axios'

import { getErrorMessage } from './getErrorMessage'

export interface ApiFieldError {
  /** DTO property path (e.g. `password`, `address.city`); undefined for non-field errors. */
  field?: string
  message: string
}

const isFieldValidationError = (
  value: unknown,
): value is ApiFieldValidationError =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ApiFieldValidationError).field === 'string' &&
  Array.isArray((value as ApiFieldValidationError).messages)

/**
 * Extracts field-level errors from an `ApiValidationErrorResponse`.
 * Falls back to a single non-field error from `getErrorMessage`.
 */
export const getApiFieldErrors = (
  error: unknown,
  fallback: string,
): ApiFieldError[] => {
  if (isAxiosError<{ errors?: unknown }>(error)) {
    const errors = error.response?.data?.errors

    if (Array.isArray(errors)) {
      const fieldErrors = errors
        .filter(isFieldValidationError)
        .map(({ field, messages }) => ({
          field,
          message: messages.join('\n'),
        }))
        .filter(({ message }) => message.trim())

      if (fieldErrors.length) return fieldErrors
    }
  }

  return [{ message: getErrorMessage(error, fallback) }]
}
