ALTER TABLE "User" ADD COLUMN "appleId" TEXT;

CREATE UNIQUE INDEX "User_appleId_key" ON "User"("appleId");
CREATE INDEX "User_appleId_idx" ON "User"("appleId");
