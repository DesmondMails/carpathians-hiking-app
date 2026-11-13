-- DropForeignKey
ALTER TABLE "SavedRoute" DROP CONSTRAINT "SavedRoute_routeId_fkey";

-- DropForeignKey
ALTER TABLE "SavedRoute" DROP CONSTRAINT "SavedRoute_userId_fkey";

-- AlterTable
ALTER TABLE "SavedRoute" ALTER COLUMN "savedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "SavedRoute" ADD CONSTRAINT "SavedRoute_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedRoute" ADD CONSTRAINT "SavedRoute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
