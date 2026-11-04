import {
  DIFFICULTY_DURATION_MULTIPLIER,
  RouteDraftPreview,
} from '@hiking/shared';

import { FinalizeRouteDraftDto } from 'src/modules/routes-draft/dto/finalize-route-draft.dto';
import { Difficulty } from 'src/prisma/generated/client';

import { RouteDerivedValues } from '../types';

const FLAT_TERRAIN_SPEED_KMH = 4;
const ASCENT_SPEED_MPH = 600;

export const estimateBaseDurationH = (
  distanceM: number,
  elevationGainM: number,
): number => {
  const distanceHours = distanceM / 1000 / FLAT_TERRAIN_SPEED_KMH;
  const ascentHours = elevationGainM / ASCENT_SPEED_MPH;

  return distanceHours + ascentHours;
};

export const calculateDerivedRouteValues = (
  preview: RouteDraftPreview,
  finalizeRouteDto: FinalizeRouteDraftDto,
): RouteDerivedValues => {
  const difficulty = finalizeRouteDto.difficulty ?? Difficulty.MODERATE;

  return {
    durationH: parseFloat(
      (
        estimateBaseDurationH(
          preview.distanceM ?? 0,
          preview.elevationGainM ?? 0,
        ) * DIFFICULTY_DURATION_MULTIPLIER[difficulty]
      ).toFixed(1),
    ),
  };
};
