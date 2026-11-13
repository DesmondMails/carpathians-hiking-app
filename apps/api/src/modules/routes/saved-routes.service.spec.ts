import { NotFoundException } from '@nestjs/common';

import { Prisma, SavedRoute } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { RouteListRow, RoutesService } from './routes.service';
import { SavedRoutesService } from './saved-routes.service';
import { PoiEnrichmentService } from '../poi-enrichment/poi-enrichment.service';
import { StorageService } from '../storage/storage.service';

// Queue infrastructure is unrelated to saved-route behavior.
jest.mock('../poi-enrichment/poi-enrichment.service', () => ({
  PoiEnrichmentService: jest.fn(),
}));

const route: RouteListRow = {
  id: 'route-1',
  title: 'Говерла',
  description: null,
  region: null,
  difficulty: null,
  coverImageId: null,
  gpxAvailable: false,
  status: 'PUBLISHED',
  images: [],
  distanceM: 12000,
  elevationGainM: 800,
  durationH: 5,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-02T00:00:00Z'),
};

const saved: SavedRoute = {
  routeId: route.id,
  userId: 'user-1',
  savedAt: new Date('2026-02-01T00:00:00Z'),
};

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('Database constraint', {
    code,
    clientVersion: '7.5.0',
  });

describe('Saved routes and personalized route lists', () => {
  const prisma = {
    route: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    savedRoute: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  let routesService: RoutesService;
  let savedRoutesService: SavedRoutesService;

  beforeEach(() => {
    jest.resetAllMocks();
    const client = prisma as unknown as PrismaService;
    routesService = new RoutesService(
      client,
      {} as StorageService,
      {} as PoiEnrichmentService,
    );
    savedRoutesService = new SavedRoutesService(client, routesService);
    prisma.route.findFirst.mockResolvedValue({ id: route.id });
  });

  it('returns a boolean for each Explore card without exposing saved-user records', async () => {
    prisma.route.findMany.mockResolvedValue([
      { ...route, savedRoutes: [{ userId: saved.userId }] },
      { ...route, id: 'route-2', savedRoutes: [] },
    ]);

    const result = await routesService.getAllRoutes(saved.userId, {
      limit: 2,
      offset: 4,
    });

    expect(result.map((item) => item.isSaved)).toEqual([true, false]);
    for (const item of result) expect(item).not.toHaveProperty('savedRoutes');
    expect(result[0]).toMatchObject({
      createdAt: route.createdAt.toISOString(),
      coverImageUrl: null,
    });
    expect(prisma.route.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.route.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2,
        skip: 4,
        select: expect.objectContaining({
          savedRoutes: {
            where: { userId: saved.userId },
            select: { userId: true },
          },
        }),
      }),
    );
  });

  it('marks Saved cards true and restricts the list to the user and published routes', async () => {
    prisma.savedRoute.findMany.mockResolvedValue([{ route }]);

    await expect(
      savedRoutesService.getSavedRoutes(saved.userId),
    ).resolves.toEqual([
      expect.objectContaining({ id: route.id, isSaved: true }),
    ]);
    expect(prisma.savedRoute.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: saved.userId, route: { status: 'PUBLISHED' } },
        orderBy: [{ savedAt: 'desc' }, { routeId: 'desc' }],
      }),
    );
  });

  it('rejects missing or unavailable routes before creating a save', async () => {
    prisma.route.findFirst.mockResolvedValue(null);

    await expect(
      savedRoutesService.saveRoute(route.id, saved.userId),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.route.findFirst).toHaveBeenCalledWith({
      where: { id: route.id, status: 'PUBLISHED' },
      select: { id: true },
    });
    expect(prisma.savedRoute.upsert).not.toHaveBeenCalled();
  });

  it('allows repeated saves without replacing the original savedAt', async () => {
    prisma.savedRoute.upsert.mockResolvedValue(saved);

    await expect(
      savedRoutesService.saveRoute(route.id, saved.userId),
    ).resolves.toEqual(saved);
    await expect(
      savedRoutesService.saveRoute(route.id, saved.userId),
    ).resolves.toEqual(saved);
    expect(prisma.savedRoute.upsert).toHaveBeenLastCalledWith({
      where: { routeId_userId: { routeId: route.id, userId: saved.userId } },
      create: { routeId: route.id, userId: saved.userId },
      update: {},
    });
  });

  it('recovers the existing save after a concurrent unique-key conflict', async () => {
    prisma.savedRoute.upsert.mockRejectedValue(prismaError('P2002'));
    prisma.savedRoute.findUnique.mockResolvedValue(saved);

    await expect(
      savedRoutesService.saveRoute(route.id, saved.userId),
    ).resolves.toEqual(saved);
    expect(prisma.savedRoute.findUnique).toHaveBeenCalledWith({
      where: {
        routeId_userId: { routeId: route.id, userId: saved.userId },
        route: { status: 'PUBLISHED' },
      },
    });
  });

  it('returns 404 if the route is deleted between validation and saving', async () => {
    prisma.savedRoute.upsert.mockRejectedValue(prismaError('P2003'));

    await expect(
      savedRoutesService.saveRoute(route.id, saved.userId),
    ).rejects.toThrow(NotFoundException);
  });

  it('allows repeated unsaves and removes only the current user’s link, including archived routes', async () => {
    prisma.savedRoute.deleteMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    await expect(
      savedRoutesService.deleteSaving(route.id, saved.userId),
    ).resolves.toBeUndefined();
    await expect(
      savedRoutesService.deleteSaving(route.id, saved.userId),
    ).resolves.toBeUndefined();
    expect(prisma.savedRoute.deleteMany).toHaveBeenLastCalledWith({
      where: { routeId: route.id, userId: saved.userId },
    });
    expect(prisma.route.findFirst).not.toHaveBeenCalled();
  });
});
