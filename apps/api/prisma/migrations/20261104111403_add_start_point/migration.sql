-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "startPoint" geography(Point, 4326);

-- AlterTable
ALTER TABLE "RouteDraft" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '1 hour';

-- CreateIndex
CREATE INDEX "Route_startPoint_idx" ON "Route" USING GIST ("startPoint");
