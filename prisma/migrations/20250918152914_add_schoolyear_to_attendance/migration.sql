-- AlterTable
ALTER TABLE "public"."Attendance" ADD COLUMN     "schoolYearId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "public"."SchoolYear"("schoolYearId") ON DELETE SET NULL ON UPDATE CASCADE;
