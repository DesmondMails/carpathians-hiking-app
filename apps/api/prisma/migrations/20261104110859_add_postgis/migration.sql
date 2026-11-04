-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- AlterTable
ALTER TABLE "RouteDraft" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '1 hour';
