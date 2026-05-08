import type { EditableRoute } from '@hiking/shared';

import type { Route, RouteImage } from 'src/prisma/generated/client';

export const toEditableRoute = (
  route: Route & { images: RouteImage[] },
  imageUrls: string[],
): EditableRoute => {
  const images = route.images.map((image, index) => ({
    id: image.id,
    url: imageUrls[index],
    sortOrder: image.sortOrder,
    isCover: image.id === route.coverImageId,
  }));

  return {
    id: route.id,
    title: route.title,
    description: route.description,
    region: route.region,
    difficulty: route.difficulty,
    coverImageId: route.coverImageId,
    gpxAvailable: route.gpxAvailable,
    status: route.status,
    images,
    createdAt: route.createdAt.toISOString(),
    updatedAt: route.updatedAt.toISOString(),
  };
};
