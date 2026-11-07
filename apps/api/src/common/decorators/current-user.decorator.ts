import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthenticatedUser } from 'src/modules/auth/interfaces';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();

    return request.user;
  },
);
