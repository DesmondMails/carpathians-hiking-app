import { BadRequestException, ValidationError } from '@nestjs/common';

import type {
  ApiFieldValidationError,
  ApiValidationErrorResponse,
} from '@hiking/shared/types/api-error';

/**
 * Flattens class-validator errors (including nested DTOs) into
 * `{ field, messages }` pairs. Deliberately drops `target` and `value`
 * so request payloads (e.g. passwords) are never echoed back to the client.
 */
export const flattenValidationErrors = (
  errors: ValidationError[],
  parentPath?: string,
): ApiFieldValidationError[] =>
  errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const messages = Object.values(error.constraints ?? {});
    const own = messages.length ? [{ field, messages }] : [];

    return [...own, ...flattenValidationErrors(error.children ?? [], field)];
  });

export const validationExceptionFactory = (
  errors: ValidationError[],
): BadRequestException => {
  const fieldErrors = flattenValidationErrors(errors);

  const body: ApiValidationErrorResponse = {
    statusCode: 400,
    error: 'Bad Request',
    message: fieldErrors.flatMap(({ messages }) => messages),
    errors: fieldErrors,
  };

  return new BadRequestException(body);
};
