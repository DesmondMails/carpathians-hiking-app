import { RouteDraftPreview } from '@hiking/shared';

import { FinalizeRouteDraftDto } from 'src/modules/routes-draft/dto/finalize-route-draft.dto';
import { Difficulty } from 'src/prisma/generated/client';

import { RouteDerivedValues } from '../types';

const FLAT_TERRAIN_SPEED_KMH = 4;
const ASCENT_SPEED_MPH = 600;

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  EASY: 1,
  MODERATE: 1.1,
  HARD: 1.25,
  EXTREME: 1.45,
};

export const calculateDerivedRouteValues = (
  preview: RouteDraftPreview,
  finalizeRouteDto: FinalizeRouteDraftDto,
): RouteDerivedValues => {
  const distanceM = preview.distanceM ?? 0;
  const elevationGainM = preview.elevationGainM ?? 0;
  const difficulty = finalizeRouteDto.difficulty ?? Difficulty.MODERATE;

  const distanceHours = distanceM / 1000 / FLAT_TERRAIN_SPEED_KMH;
  const ascentHours = elevationGainM / ASCENT_SPEED_MPH;
  const durationH =
    (distanceHours + ascentHours) * DIFFICULTY_MULTIPLIER[difficulty];

  return {
    durationH: parseFloat(durationH.toFixed(1)),
  };
};
