export interface ApiFieldValidationError {
  /** DTO property path, e.g. `password` or `address.city` for nested DTOs. */
  field: string
  messages: string[]
}

/** Body of a 400 response produced by the global ValidationPipe. */
export interface ApiValidationErrorResponse {
  statusCode: 400
  error: 'Bad Request'
  /** All messages flattened, Nest-compatible shape for generic error handling. */
  message: string[]
  errors: ApiFieldValidationError[]
}
