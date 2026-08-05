-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "emailFields" JSONB;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
