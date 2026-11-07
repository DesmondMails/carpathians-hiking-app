import { PublicUser } from '@hiking/shared';

import type { AuthenticatedUser } from 'src/modules/auth/interfaces';
import { User } from 'src/prisma/generated/client';

export const toPublicUser = (user: AuthenticatedUser | User): PublicUser => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  name: user.name,
});
