import type { RouteDraftPreview } from '@hiking/shared';
import { BadRequestException } from '@nestjs/common';

import {
  asCoordinates,
  asElevationProfile,
  asNumber,
  asString,
  isJsonObject,
} from 'src/common/utils/json-guards';
import type { Prisma } from 'src/prisma/generated/client';

export function parsePreview(
  previewJson: Prisma.JsonValue | null,
): RouteDraftPreview {
  if (!isJsonObject(previewJson)) {
    throw new BadRequestException('Draft previewJson має бути обʼєктом');
  }

  const version = asNumber(previewJson.version);
  if (version !== 1) {
    throw new BadRequestException('Непідтримувана версія previewJson');
  }

  const parsed: RouteDraftPreview = {
    version: 1,
    distanceM: asNumber(previewJson.distanceM),
    elevationGainM: asNumber(previewJson.elevationGainM),
    region: asString(previewJson.region),
    coordinates: asCoordinates(previewJson.coordinates),
    elevationProfile: asElevationProfile(previewJson.elevationProfile),
  };

  if (!parsed.coordinates || parsed.coordinates.length < 2) {
    throw new BadRequestException(
      'previewJson.coordinates має містити мінімум 2 валідні точки',
    );
  }

  return parsed;
}
