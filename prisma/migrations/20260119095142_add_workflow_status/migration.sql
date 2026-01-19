-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "workflow" ADD COLUMN     "status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT';
