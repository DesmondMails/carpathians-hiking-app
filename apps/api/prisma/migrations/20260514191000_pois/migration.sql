/*
  Warnings:

  - You are about to drop the column `poiMarkersJson` on the `Route` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RoutePoiProvider" AS ENUM ('OVERPASS');

-- CreateEnum
CREATE TYPE "RoutePoiOsmType" AS ENUM ('NODE', 'WAY', 'RELATION');

-- CreateEnum
CREATE TYPE "RoutePoiType" AS ENUM ('WATER', 'SHELTER', 'VIEWPOINT', 'PEAK');

-- CreateEnum
CREATE TYPE "RoutePoiConfidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "RoutePoiWaterPotability" AS ENUM ('CONFIRMED', 'UNKNOWN', 'NON_POTABLE');

-- CreateEnum
CREATE TYPE "RoutePoiAccess" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "RoutePoiEnrichmentStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "poiMarkersJson",
ADD COLUMN     "poiEnrichedAt" TIMESTAMP(3),
ADD COLUMN     "poiEnrichmentError" TEXT,
ADD COLUMN     "poiEnrichmentStatus" "RoutePoiEnrichmentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "RouteDraft" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '1 hour';

-- CreateTable
CREATE TABLE "RoutePoiSource" (
    "id" TEXT NOT NULL,
    "provider" "RoutePoiProvider" NOT NULL,
    "osmType" "RoutePoiOsmType" NOT NULL,
    "osmId" TEXT NOT NULL,
    "rawTagsJson" JSONB NOT NULL,
    "rawGeometryCenterJson" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "RoutePoiSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutePoi" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "type" "RoutePoiType" NOT NULL,
    "subtype" TEXT,
    "label" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "distanceFromRouteM" DOUBLE PRECISION NOT NULL,
    "distanceFromStartM" DOUBLE PRECISION NOT NULL,
    "confidence" "RoutePoiConfidence" NOT NULL,
    "waterPotability" "RoutePoiWaterPotability" NOT NULL,
    "access" "RoutePoiAccess" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "metadataJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutePoi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoutePoiSource_provider_osmType_osmId_key" ON "RoutePoiSource"("provider", "osmType", "osmId");

-- CreateIndex
CREATE INDEX "RoutePoi_routeId_idx" ON "RoutePoi"("routeId");

-- CreateIndex
CREATE INDEX "RoutePoi_routeId_type_idx" ON "RoutePoi"("routeId", "type");

-- CreateIndex
CREATE INDEX "RoutePoi_routeId_sortOrder_idx" ON "RoutePoi"("routeId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "RoutePoi_routeId_sourceId_key" ON "RoutePoi"("routeId", "sourceId");

-- AddForeignKey
ALTER TABLE "RoutePoi" ADD CONSTRAINT "RoutePoi_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePoi" ADD CONSTRAINT "RoutePoi_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "RoutePoiSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
