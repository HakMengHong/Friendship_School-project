/*
  Warnings:

  - A unique constraint covering the columns `[subjectCode]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subjectCode` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "subjectCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subjectCode_key" ON "Subject"("subjectCode");
