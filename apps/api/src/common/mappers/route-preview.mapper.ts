import { estimateBaseDurationH } from 'src/modules/routes/utils/calculate-derived-route-values';
import { ParsedGpx } from 'src/modules/routes-draft/interfaces';
import { Prisma } from 'src/prisma/generated/client';

export const toPreviewJson = (parsedGpx: ParsedGpx): Prisma.InputJsonValue => {
  return {
    version: 1,
    baseDurationH: estimateBaseDurationH(
      parsedGpx.distanceM,
      parsedGpx.elevationGainM,
    ),
    ...parsedGpx,
  } as unknown as Prisma.InputJsonValue;
};
