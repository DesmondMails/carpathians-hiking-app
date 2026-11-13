-- CreateTable
CREATE TABLE "SavedRoute" (
    "routeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedRoute_pkey" PRIMARY KEY ("routeId","userId")
);

-- CreateIndex
CREATE INDEX "SavedRoute_routeId_idx" ON "SavedRoute"("routeId");

-- CreateIndex
CREATE INDEX "SavedRoute_userId_idx" ON "SavedRoute"("userId");

-- AddForeignKey
ALTER TABLE "SavedRoute" ADD CONSTRAINT "SavedRoute_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedRoute" ADD CONSTRAINT "SavedRoute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
