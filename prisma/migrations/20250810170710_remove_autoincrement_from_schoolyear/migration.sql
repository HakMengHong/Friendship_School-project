/*
  Warnings:

  - You are about to drop the column `class` on the `Course` table. All the data in the column will be lost.
  - Added the required column `grade` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "class",
ADD COLUMN     "grade" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SchoolYear" ALTER COLUMN "schoolYearId" DROP DEFAULT;
DROP SEQUENCE "SchoolYear_schoolYearId_seq";
