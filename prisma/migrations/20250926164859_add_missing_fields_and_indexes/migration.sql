-- AlterTable
ALTER TABLE "public"."Guardian" ADD COLUMN     "commune" TEXT;

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "studentCommune" TEXT;

-- CreateIndex
CREATE INDEX "Course_schoolYearId_grade_section_idx" ON "public"."Course"("schoolYearId", "grade", "section");

-- CreateIndex
CREATE INDEX "Course_teacherId1_idx" ON "public"."Course"("teacherId1");

-- CreateIndex
CREATE INDEX "Course_teacherId2_idx" ON "public"."Course"("teacherId2");

-- CreateIndex
CREATE INDEX "Course_teacherId3_idx" ON "public"."Course"("teacherId3");

-- CreateIndex
CREATE INDEX "Grade_studentId_courseId_idx" ON "public"."Grade"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "Grade_gradeDate_idx" ON "public"."Grade"("gradeDate");

-- CreateIndex
CREATE INDEX "Grade_courseId_studentId_subjectId_idx" ON "public"."Grade"("courseId", "studentId", "subjectId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "public"."User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");
