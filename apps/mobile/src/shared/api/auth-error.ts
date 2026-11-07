import { isAxiosError } from 'axios'

// True only when the server actually rejected the credentials.
// Network errors, timeouts and 5xx mean "couldn't check", not "session is invalid".
export const isAuthRejection = (error: unknown): boolean => {
  if (!isAxiosError(error)) return false

  const status = error.response?.status

  return status === 401 || status === 403
}
