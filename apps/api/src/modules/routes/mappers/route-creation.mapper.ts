import { RouteDraftPreview } from '@hiking/shared';

import { RouteDerivedValues } from 'src/modules/routes/types';
import { FinalizeRouteDraftDto } from 'src/modules/routes-draft/dto/finalize-route-draft.dto';
import {
  Difficulty,
  Prisma,
  RouteDraft,
  RouteStatus,
} from 'src/prisma/generated/client';

export const toRouteCreateInput = (
  draft: RouteDraft,
  preview: RouteDraftPreview,
  finalize: FinalizeRouteDraftDto,
  derived: RouteDerivedValues,
): Prisma.RouteUncheckedCreateInput => {
  return {
    createdByUserId: draft.createdByUserId,
    draftId: draft.id,

    title: finalize.title ?? draft.title ?? 'Untitled route',
    description: finalize.description ?? draft.description,
    region: finalize.region ?? preview.region,
    difficulty: finalize.difficulty ?? Difficulty.MODERATE,
    notes: finalize.notes,

    distanceM: preview.distanceM,
    elevationGainM: preview.elevationGainM,
    durationH: derived.durationH,
    coverImageId: finalize.coverImageId,
    routeCoordinatesJson: preview.coordinates,
    elevationProfileJson: preview.elevationProfile,

    gpxStorageKey: draft.gpxStorageKey,
    gpxAvailable: Boolean(draft.gpxStorageKey),
    status: RouteStatus.PUBLISHED as RouteStatus,
  };
};
