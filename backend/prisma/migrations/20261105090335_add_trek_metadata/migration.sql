-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MODERATE', 'CHALLENGING', 'STRENUOUS');

-- AlterTable
ALTER TABLE "package" ADD COLUMN     "bestSeason" TEXT,
ADD COLUMN     "difficulty" "Difficulty",
ADD COLUMN     "durationDays" INTEGER,
ADD COLUMN     "groupSize" INTEGER,
ADD COLUMN     "maxAltitude" INTEGER;
