/*
  Warnings:

  - You are about to drop the column `coverImageUrl` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrlsJson` on the `Route` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RouteImageStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "coverImageUrl",
DROP COLUMN "imageUrlsJson",
ADD COLUMN     "coverImageId" TEXT;

-- AlterTable
ALTER TABLE "RouteDraft" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '1 hour';

-- AlterTable
ALTER TABLE "RouteImage" ADD COLUMN     "status" "RouteImageStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "RouteDraftImage" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteDraftImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RouteDraftImage_draftId_idx" ON "RouteDraftImage"("draftId");

-- CreateIndex
CREATE INDEX "RouteImage_routeId_status_idx" ON "RouteImage"("routeId", "status");

-- CreateIndex
CREATE INDEX "RouteImage_uploadedByUserId_idx" ON "RouteImage"("uploadedByUserId");

-- AddForeignKey
ALTER TABLE "RouteDraftImage" ADD CONSTRAINT "RouteDraftImage_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "RouteDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteImage" ADD CONSTRAINT "RouteImage_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteImage" ADD CONSTRAINT "RouteImage_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
