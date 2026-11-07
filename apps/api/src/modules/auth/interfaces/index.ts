import { Prisma } from 'src/prisma/generated/client';

export interface GoogleUserPayload {
  googleId: string;
  email: string;
  avatar?: string;
}

export const authenticatedUserSelect = {
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  name: true,
} satisfies Prisma.UserSelect;

/** User attached to `request.user` by JwtStrategy.validate */
export type AuthenticatedUser = Prisma.UserGetPayload<{
  select: typeof authenticatedUserSelect;
}>;
