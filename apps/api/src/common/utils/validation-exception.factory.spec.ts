import { ValidationError } from '@nestjs/common';

import {
  flattenValidationErrors,
  validationExceptionFactory,
} from './validation-exception.factory';

const makeError = (
  overrides: Partial<ValidationError> & Pick<ValidationError, 'property'>,
): ValidationError => ({
  children: [],
  ...overrides,
});

describe('validationExceptionFactory', () => {
  it('returns field errors and flat messages without target/value', () => {
    const exception = validationExceptionFactory([
      makeError({
        property: 'password',
        target: { email: 'a@b.c', password: 'secret1' },
        value: 'secret1',
        constraints: { matches: 'Пароль занадто слабкий.' },
      }),
    ]);

    const body = exception.getResponse();

    expect(exception.getStatus()).toBe(400);
    expect(body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['Пароль занадто слабкий.'],
      errors: [{ field: 'password', messages: ['Пароль занадто слабкий.'] }],
    });
    expect(JSON.stringify(body)).not.toContain('secret1');
  });

  it('builds dotted paths for nested DTOs and skips nodes without constraints', () => {
    const result = flattenValidationErrors([
      makeError({
        property: 'address',
        children: [
          makeError({
            property: 'city',
            constraints: {
              isString: 'Місто має бути рядком',
              isNotEmpty: 'Місто обовʼязкове',
            },
          }),
        ],
      }),
    ]);

    expect(result).toEqual([
      {
        field: 'address.city',
        messages: ['Місто має бути рядком', 'Місто обовʼязкове'],
      },
    ]);
  });
});
