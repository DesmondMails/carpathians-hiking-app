import { PublicUser } from '@hiking/shared';

import { User } from 'src/prisma/generated/client';

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
