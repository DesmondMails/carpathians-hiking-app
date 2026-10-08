-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "poiEnrichedFailedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RouteDraft" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '1 hour';
