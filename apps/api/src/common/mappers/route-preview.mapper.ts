import { ParsedGpx } from 'src/modules/routes-draft/interfaces';
import { Prisma } from 'src/prisma/generated/client';

export const toPreviewJson = (parsedGpx: ParsedGpx): Prisma.InputJsonValue => {
  return {
    version: 1,
    region: '',
    durationH: 0,
    ...parsedGpx,
  };
};
