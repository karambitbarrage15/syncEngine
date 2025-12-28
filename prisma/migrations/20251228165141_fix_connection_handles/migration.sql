-- AlterTable
ALTER TABLE "Connection" ALTER COLUMN "fromOutput" SET DEFAULT 'main',
ALTER COLUMN "fromOutput" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;
