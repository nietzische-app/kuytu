-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alcohol" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "pets" TEXT,
ADD COLUMN     "profileCompletion" INTEGER NOT NULL DEFAULT 40,
ADD COLUMN     "smoking" TEXT,
ADD COLUMN     "zodiac" TEXT;
