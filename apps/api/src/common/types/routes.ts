import { ROUTE_LIST_SELECT } from 'src/modules/routes/constants';
import { Prisma } from 'src/prisma/generated/client';

export type RouteListRow = Prisma.RouteGetPayload<{
  select: typeof ROUTE_LIST_SELECT;
}>;

export type RouteListRowWithSaveState = RouteListRow & { isSaved: boolean };

export type RouteListRowWithSavedRoutes = Prisma.RouteGetPayload<{
  select: typeof ROUTE_LIST_SELECT & {
    savedRoutes: { select: { userId: true } };
  };
}>;
