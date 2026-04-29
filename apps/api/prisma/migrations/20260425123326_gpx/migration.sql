/*
  Warnings:

  - You are about to drop the column `gpxAvailable` on the `Route` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Route" DROP COLUMN "gpxAvailable";

-- AlterTable
ALTER TABLE "RouteDraft" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '1 hour';
