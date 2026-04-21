import { RouteDraftPreview } from '@hiking/shared';

import { FinalizeRouteDraftDto } from 'src/modules/routes-draft/dto/finalize-route-draft.dto';
import { Prisma, RouteDraft, RouteStatus } from 'src/prisma/generated/client';

export const toRouteCreateInput = (
  draft: RouteDraft,
  preview: RouteDraftPreview,
  finalize: FinalizeRouteDraftDto,
): Prisma.RouteUncheckedCreateInput => {
  return {
    createdByUserId: draft.createdByUserId,
    draftId: draft.id,

    title: finalize.title ?? draft.title ?? 'Untitled route',
    description: finalize.description ?? draft.description,
    region: finalize.region ?? preview.region,
    difficulty: finalize.difficulty ?? preview.difficulty,
    notes: finalize.notes,

    distanceM: preview.distanceM,
    elevationGainM: preview.elevationGainM,
    durationH: preview.durationH,
    // routeCoordinatesJson: preview.coordinates as Prisma.JsonValue,

    gpxStorageKey: draft.gpxStorageKey,
    gpxAvailable: Boolean(draft.gpxStorageKey),
    status: RouteStatus.PUBLISHED as RouteStatus,
  };
};
