-- CreateEnum
CREATE TYPE "GradeType" AS ENUM ('exam', 'quiz', 'assignment', 'participation', 'other');

-- CreateEnum
CREATE TYPE "AttendanceSession" AS ENUM ('AM', 'PM', 'FULL');

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "phonenumber1" TEXT,
    "phonenumber2" TEXT,
    "role" TEXT NOT NULL DEFAULT 'teacher',
    "avatar" TEXT,
    "photo" TEXT,
    "position" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Student" (
    "studentId" SERIAL NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "class" TEXT NOT NULL,
    "photo" TEXT,
    "phone" TEXT,
    "registrationDate" TIMESTAMP(3),
    "status" TEXT,
    "religion" TEXT,
    "health" TEXT,
    "emergencyContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER,
    "needsClothes" BOOLEAN DEFAULT false,
    "needsMaterials" BOOLEAN DEFAULT false,
    "needsTransport" BOOLEAN DEFAULT false,
    "previousSchool" TEXT,
    "registerToStudy" BOOLEAN DEFAULT false,
    "studentBirthDistrict" TEXT,
    "studentDistrict" TEXT,
    "studentHouseNumber" TEXT,
    "studentProvince" TEXT,
    "studentVillage" TEXT,
    "transferReason" TEXT,
    "vaccinated" BOOLEAN DEFAULT false,
    "schoolYear" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "guardianId" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "relation" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "believeJesus" BOOLEAN DEFAULT false,
    "birthDistrict" TEXT,
    "childrenCount" INTEGER,
    "church" TEXT,
    "district" TEXT,
    "firstName" TEXT,
    "houseNumber" TEXT,
    "income" DOUBLE PRECISION,
    "lastName" TEXT,
    "occupation" TEXT,
    "province" TEXT,
    "village" TEXT,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("guardianId")
);

-- CreateTable
CREATE TABLE "FamilyInfo" (
    "familyinfoId" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canHelpSchool" BOOLEAN DEFAULT false,
    "churchName" TEXT,
    "durationInKPC" TEXT,
    "helpAmount" DOUBLE PRECISION,
    "helpFrequency" TEXT,
    "knowSchool" TEXT,
    "livingCondition" TEXT,
    "livingWith" TEXT,
    "organizationHelp" TEXT,
    "ownHouse" BOOLEAN DEFAULT false,
    "religion" TEXT,

    CONSTRAINT "FamilyInfo_pkey" PRIMARY KEY ("familyinfoId")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "scholarshipId" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "type" TEXT,
    "amount" DOUBLE PRECISION,
    "sponsor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("scholarshipId")
);

-- CreateTable
CREATE TABLE "Course" (
    "courseId" SERIAL NOT NULL,
    "schoolYearId" INTEGER NOT NULL,
    "teacherId1" INTEGER,
    "teacherId2" INTEGER,
    "teacherId3" INTEGER,
    "grade" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "Subject" (
    "subjectId" SERIAL NOT NULL,
    "subjectName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("subjectId")
);

-- CreateTable
CREATE TABLE "Grade" (
    "gradeId" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "gradeDate" TIMESTAMP(3) NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "gradeComment" TEXT,
    "user" TEXT,
    "lastEdit" TIMESTAMP(3),
    "gradeType" "GradeType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gradeCode" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("gradeId")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "enrollmentId" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "drop" BOOLEAN NOT NULL,
    "dropSemester" TEXT,
    "dropDate" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("enrollmentId")
);

-- CreateTable
CREATE TABLE "SchoolYear" (
    "schoolYearId" SERIAL NOT NULL,
    "schoolYearCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolYear_pkey" PRIMARY KEY ("schoolYearId")
);

-- CreateTable
CREATE TABLE "Semester" (
    "semesterId" SERIAL NOT NULL,
    "semester" TEXT NOT NULL,
    "semesterCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("semesterId")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "session" "AttendanceSession" NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClassTeacher" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClassTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyInfo_studentId_key" ON "FamilyInfo"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_gradeCode_key" ON "Grade"("gradeCode");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolYear_schoolYearCode_key" ON "SchoolYear"("schoolYearCode");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_semesterCode_key" ON "Semester"("semesterCode");

-- CreateIndex
CREATE INDEX "_ClassTeacher_B_index" ON "_ClassTeacher"("B");

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInfo" ADD CONSTRAINT "FamilyInfo_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "SchoolYear"("schoolYearId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("semesterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassTeacher" ADD CONSTRAINT "_ClassTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassTeacher" ADD CONSTRAINT "_ClassTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
