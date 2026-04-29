-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "gpxAvailable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RouteDraft" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '1 hour';
