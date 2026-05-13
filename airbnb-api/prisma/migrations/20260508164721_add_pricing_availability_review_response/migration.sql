-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "baseGuests" INTEGER,
ADD COLUMN     "extraGuestFee" DOUBLE PRECISION,
ADD COLUMN     "maxNights" INTEGER,
ADD COLUMN     "minNights" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "monthlyDiscount" DOUBLE PRECISION,
ADD COLUMN     "weekendPrice" DOUBLE PRECISION,
ADD COLUMN     "weeklyDiscount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "hostRespondedAt" TIMESTAMP(3),
ADD COLUMN     "hostResponse" TEXT;

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlockedDate_listingId_idx" ON "BlockedDate"("listingId");

-- CreateIndex
CREATE INDEX "BlockedDate_date_idx" ON "BlockedDate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDate_listingId_date_key" ON "BlockedDate"("listingId", "date");

-- AddForeignKey
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
