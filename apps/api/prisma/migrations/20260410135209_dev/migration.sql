/*
  Warnings:

  - A unique constraint covering the columns `[draftId]` on the table `Route` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RouteDraftStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED', 'FINALIZED');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MODERATE', 'HARD', 'EXTREME');

-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('LOOP', 'OUT_AND_BACK', 'POINT_TO_POINT');

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "difficulty" "Difficulty",
ADD COLUMN     "draftId" TEXT,
ADD COLUMN     "durationH" DOUBLE PRECISION,
ADD COLUMN     "elevationProfileJson" JSONB,
ADD COLUMN     "gpxAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gpxStorageKey" TEXT,
ADD COLUMN     "imageUrlsJson" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "poiMarkersJson" JSONB,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "routeCoordinatesJson" JSONB,
ADD COLUMN     "routeType" "RouteType",
ADD COLUMN     "status" "RouteStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "RouteDraft" (
    "id" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "status" "RouteDraftStatus" NOT NULL DEFAULT 'PROCESSING',
    "sourceFileName" TEXT NOT NULL,
    "gpxStorageKey" TEXT,
    "title" TEXT,
    "description" TEXT,
    "previewJson" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RouteDraft_createdByUserId_idx" ON "RouteDraft"("createdByUserId");

-- CreateIndex
CREATE INDEX "RouteDraft_status_idx" ON "RouteDraft"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Route_draftId_key" ON "Route"("draftId");

-- CreateIndex
CREATE INDEX "Route_createdByUserId_idx" ON "Route"("createdByUserId");

-- CreateIndex
CREATE INDEX "Route_status_idx" ON "Route"("status");

-- AddForeignKey
ALTER TABLE "RouteDraft" ADD CONSTRAINT "RouteDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "RouteDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
