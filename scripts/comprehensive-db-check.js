const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Comprehensive Database Check');
  console.log('================================\n');

  try {
    // Check Users
    console.log('👥 Checking Users...');
    const users = await prisma.user.findMany();
    console.log(`Users count: ${users.length}`);
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`  - ${user.username} (${user.firstname} ${user.lastname}) - Role: ${user.role} - Status: ${user.status}`);
        if (user.failedLoginAttempts > 0) {
          console.log(`    Failed attempts: ${user.failedLoginAttempts}`);
        }
        if (user.accountLockedUntil) {
          console.log(`    Locked until: ${user.accountLockedUntil}`);
        }
      });
    } else {
      console.log('  No users found');
    }

    // Check Students
    console.log('\n🎓 Checking Students...');
    const students = await prisma.student.findMany();
    console.log(`Students count: ${students.length}`);
    if (students.length > 0) {
      students.slice(0, 5).forEach(student => {
        console.log(`  - ${student.firstName} ${student.lastName} (Class: ${student.class})`);
      });
      if (students.length > 5) {
        console.log(`  ... and ${students.length - 5} more students`);
      }
    } else {
      console.log('  No students found');
    }

    // Check School Years
    console.log('\n📅 Checking School Years...');
    const schoolYears = await prisma.schoolYear.findMany();
    console.log(`School Years count: ${schoolYears.length}`);
    if (schoolYears.length > 0) {
      schoolYears.forEach(year => {
        console.log(`  - ${year.schoolYearCode}`);
      });
    } else {
      console.log('  No school years found');
    }

    // Check Courses
    console.log('\n📚 Checking Courses...');
    const courses = await prisma.course.findMany();
    console.log(`Courses count: ${courses.length}`);
    if (courses.length > 0) {
      courses.forEach(course => {
        console.log(`  - ${course.courseName} (Grade: ${course.grade}, Section: ${course.section})`);
      });
    } else {
      console.log('  No courses found');
    }

    // Check Subjects
    console.log('\n📖 Checking Subjects...');
    const subjects = await prisma.subject.findMany();
    console.log(`Subjects count: ${subjects.length}`);
    if (subjects.length > 0) {
      subjects.forEach(subject => {
        console.log(`  - ${subject.subjectName}`);
      });
    } else {
      console.log('  No subjects found');
    }

    // Check Semesters
    console.log('\n📆 Checking Semesters...');
    const semesters = await prisma.semester.findMany();
    console.log(`Semesters count: ${semesters.length}`);
    if (semesters.length > 0) {
      semesters.forEach(semester => {
        console.log(`  - ${semester.semester} (Code: ${semester.semesterCode})`);
      });
    } else {
      console.log('  No semesters found');
    }

    // Check Enrollments
    console.log('\n📝 Checking Enrollments...');
    const enrollments = await prisma.enrollment.findMany();
    console.log(`Enrollments count: ${enrollments.length}`);
    if (enrollments.length > 0) {
      enrollments.slice(0, 5).forEach(enrollment => {
        console.log(`  - Student ${enrollment.studentId} in Course ${enrollment.courseId}`);
      });
      if (enrollments.length > 5) {
        console.log(`  ... and ${enrollments.length - 5} more enrollments`);
      }
    } else {
      console.log('  No enrollments found');
    }

    // Check Grades
    console.log('\n📊 Checking Grades...');
    const grades = await prisma.grade.findMany();
    console.log(`Grades count: ${grades.length}`);
    if (grades.length > 0) {
      grades.slice(0, 5).forEach(grade => {
        console.log(`  - Student ${grade.studentId} in Subject ${grade.subjectId}: ${grade.grade}`);
      });
      if (grades.length > 5) {
        console.log(`  ... and ${grades.length - 5} more grades`);
      }
    } else {
      console.log('  No grades found');
    }

    // Check Attendance
    console.log('\n📋 Checking Attendance...');
    const attendance = await prisma.attendance.findMany();
    console.log(`Attendance records count: ${attendance.length}`);
    if (attendance.length > 0) {
      attendance.slice(0, 5).forEach(record => {
        console.log(`  - Student ${record.studentId} on ${record.attendanceDate}: ${record.status}`);
      });
      if (attendance.length > 5) {
        console.log(`  ... and ${attendance.length - 5} more records`);
      }
    } else {
      console.log('  No attendance records found');
    }

    console.log('\n✅ Database check completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Students: ${students.length}`);
    console.log(`- School Years: ${schoolYears.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Subjects: ${subjects.length}`);
    console.log(`- Semesters: ${semesters.length}`);
    console.log(`- Enrollments: ${enrollments.length}`);
    console.log(`- Grades: ${grades.length}`);
    console.log(`- Attendance Records: ${attendance.length}`);

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
