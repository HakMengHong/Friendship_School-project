/*
  Warnings:

  - You are about to drop the `_ClassTeacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ClassTeacher" DROP CONSTRAINT "_ClassTeacher_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ClassTeacher" DROP CONSTRAINT "_ClassTeacher_B_fkey";

-- DropTable
DROP TABLE "public"."_ClassTeacher";

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_teacherId1_fkey" FOREIGN KEY ("teacherId1") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_teacherId2_fkey" FOREIGN KEY ("teacherId2") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_teacherId3_fkey" FOREIGN KEY ("teacherId3") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
