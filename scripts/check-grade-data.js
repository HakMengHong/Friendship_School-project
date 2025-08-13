const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGradeData() {
  try {
    console.log('🔍 Checking Database Structure for Grade System...\n');

    // Check School Years
    console.log('📅 School Years:');
    const schoolYears = await prisma.schoolYear.findMany({
      orderBy: { schoolYearCode: 'asc' }
    });
    console.log(`   Count: ${schoolYears.length}`);
    schoolYears.forEach(sy => {
      console.log(`   - ${sy.schoolYearCode} (ID: ${sy.schoolYearId})`);
    });

    // Check Semesters
    console.log('\n📚 Semesters:');
    const semesters = await prisma.semester.findMany({
      orderBy: { semester: 'asc' }
    });
    console.log(`   Count: ${semesters.length}`);
    semesters.forEach(sem => {
      console.log(`   - ${sem.semester} (${sem.semesterCode})`);
    });

    // Check Courses
    console.log('\n🏫 Courses:');
    const courses = await prisma.course.findMany({
      include: { schoolYear: true },
      orderBy: [{ schoolYear: { schoolYearCode: 'asc' } }, { grade: 'asc' }]
    });
    console.log(`   Count: ${courses.length}`);
    courses.slice(0, 10).forEach(course => {
      console.log(`   - Grade ${course.grade} Section ${course.section} (${course.schoolYear.schoolYearCode})`);
    });
    if (courses.length > 10) {
      console.log(`   ... and ${courses.length - 10} more courses`);
    }

    // Check Subjects
    console.log('\n📖 Subjects:');
    const subjects = await prisma.subject.findMany({
      orderBy: { subjectName: 'asc' }
    });
    console.log(`   Count: ${subjects.length}`);
    subjects.forEach(subject => {
      console.log(`   - ${subject.subjectName}`);
    });

    // Check Teachers (Users with teacher role)
    console.log('\n👨‍🏫 Teachers:');
    const teachers = await prisma.user.findMany({
      where: { role: 'teacher' },
      orderBy: { firstname: 'asc' }
    });
    console.log(`   Count: ${teachers.length}`);
    teachers.forEach(teacher => {
      console.log(`   - ${teacher.firstname} ${teacher.lastname} (${teacher.username})`);
    });

    // Check Students with Enrollments
    console.log('\n👥 Students with Enrollments:');
    const students = await prisma.student.findMany({
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                schoolYear: true
              }
            }
          }
        }
      },
      orderBy: { firstName: 'asc' }
    });
    console.log(`   Count: ${students.length}`);
    
    const studentsWithEnrollments = students.filter(s => s.enrollments.length > 0);
    console.log(`   Students with enrollments: ${studentsWithEnrollments.length}`);
    
    studentsWithEnrollments.slice(0, 5).forEach(student => {
      console.log(`   - ${student.firstName} ${student.lastName} (Grade ${student.class})`);
      student.enrollments.forEach(enrollment => {
        console.log(`     Enrolled in: ${enrollment.course.courseName} (${enrollment.course.schoolYear.schoolYearCode})`);
      });
    });

    // Check Existing Grades
    console.log('\n📊 Existing Grades:');
    const grades = await prisma.grade.findMany({
      include: {
        student: true,
        subject: true,
        course: { include: { schoolYear: true } },
        semester: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`   Count: ${grades.length}`);
    if (grades.length > 0) {
      grades.slice(0, 5).forEach(grade => {
        console.log(`   - ${grade.student.firstName} ${grade.student.lastName}: ${grade.grade} in ${grade.subject.subjectName} (${grade.course.schoolYear.schoolYearCode})`);
      });
    }

    // Summary
    console.log('\n🎉 Database Check Complete!');
    console.log('\n📊 Summary:');
    console.log(`   - School Years: ${schoolYears.length}`);
    console.log(`   - Semesters: ${semesters.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Subjects: ${subjects.length}`);
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Students with Enrollments: ${studentsWithEnrollments.length}`);
    console.log(`   - Existing Grades: ${grades.length}`);

  } catch (error) {
    console.error('❌ Error during database check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkGradeData();
