const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyCompleteDatabase() {
  try {
    console.log('🔍 Comprehensive Database Verification\n');

    // Check School Years
    console.log('📅 School Years:');
    const schoolYears = await prisma.schoolYear.findMany({
      orderBy: { schoolYearCode: 'asc' }
    });
    console.log(`   Count: ${schoolYears.length}`);
    schoolYears.forEach(sy => {
      console.log(`   - ${sy.schoolYearCode} (ID: ${sy.schoolYearId})`);
    });

    // Check Courses
    console.log('\n📚 Courses:');
    const courses = await prisma.course.findMany({
      include: { schoolYear: true },
      orderBy: [{ schoolYear: { schoolYearCode: 'asc' } }, { grade: 'asc' }]
    });
    console.log(`   Count: ${courses.length}`);
    
    // Group courses by school year
    const coursesByYear = {};
    courses.forEach(course => {
      const year = course.schoolYear.schoolYearCode;
      if (!coursesByYear[year]) coursesByYear[year] = [];
      coursesByYear[year].push(course);
    });
    
    Object.entries(coursesByYear).forEach(([year, yearCourses]) => {
      console.log(`   ${year}: ${yearCourses.length} courses`);
      yearCourses.forEach(course => {
        console.log(`     - Grade ${course.grade} Section ${course.section} (ID: ${course.courseId})`);
      });
    });

    // Check Subjects
    console.log('\n📖 Subjects:');
    const subjects = await prisma.subject.findMany({
      orderBy: { subjectName: 'asc' }
    });
    console.log(`   Count: ${subjects.length}`);
    subjects.forEach((subject, index) => {
      if (index < 10) {
        console.log(`   - ${subject.subjectName}`);
      } else if (index === 10) {
        console.log(`   ... and ${subjects.length - 10} more subjects`);
      }
    });

    // Check Students
    console.log('\n👥 Students:');
    const students = await prisma.student.findMany({
      include: {
        guardians: true,
        family: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`   Count: ${students.length}`);
    
    // Group students by school year
    const studentsByYear = {};
    students.forEach(student => {
      const year = student.schoolYear || 'Unknown';
      if (!studentsByYear[year]) studentsByYear[year] = [];
      studentsByYear[year].push(student);
    });
    
    Object.entries(studentsByYear).forEach(([year, yearStudents]) => {
      console.log(`   ${year}: ${yearStudents.length} students`);
      yearStudents.slice(0, 3).forEach(student => {
        console.log(`     - ${student.lastName} ${student.firstName} (Grade ${student.class})`);
      });
      if (yearStudents.length > 3) {
        console.log(`     ... and ${yearStudents.length - 3} more students`);
      }
    });

    // Check Guardians
    console.log('\n👨‍👩‍👧‍👦 Guardians:');
    const guardians = await prisma.guardian.findMany({
      include: { student: true }
    });
    console.log(`   Count: ${guardians.length}`);
    guardians.slice(0, 5).forEach(guardian => {
      console.log(`   - ${guardian.firstName} ${guardian.lastName} (${guardian.relation}) for ${guardian.student.firstName} ${guardian.student.lastName}`);
    });
    if (guardians.length > 5) {
      console.log(`   ... and ${guardians.length - 5} more guardians`);
    }

    // Check Family Info
    console.log('\n🏠 Family Info:');
    const familyInfo = await prisma.familyInfo.findMany({
      include: { student: true }
    });
    console.log(`   Count: ${familyInfo.length}`);
    familyInfo.slice(0, 3).forEach(family => {
      console.log(`   - ${family.student.firstName} ${family.student.lastName}: ${family.livingWith}, ${family.livingCondition}`);
    });
    if (familyInfo.length > 3) {
      console.log(`   ... and ${familyInfo.length - 3} more family records`);
    }

    // Check Enrollments
    console.log('\n📝 Enrollments:');
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: true,
        course: { include: { schoolYear: true } }
      }
    });
    console.log(`   Count: ${enrollments.length}`);
    if (enrollments.length > 0) {
      enrollments.slice(0, 5).forEach(enrollment => {
        console.log(`   - ${enrollment.student.firstName} ${enrollment.student.lastName} in Grade ${enrollment.course.grade} (${enrollment.course.schoolYear.schoolYearCode})`);
      });
      if (enrollments.length > 5) {
        console.log(`   ... and ${enrollments.length - 5} more enrollments`);
      }
    } else {
      console.log('   No enrollments found');
    }

    // Check Grades
    console.log('\n📊 Grades:');
    const grades = await prisma.grade.findMany({
      include: {
        student: true,
        subject: true,
        course: { include: { schoolYear: true } }
      }
    });
    console.log(`   Count: ${grades.length}`);
    if (grades.length > 0) {
      grades.slice(0, 5).forEach(grade => {
        console.log(`   - ${grade.student.firstName} ${grade.student.lastName}: ${grade.grade} in ${grade.subject.subjectName} (${grade.course.schoolYear.schoolYearCode})`);
      });
      if (grades.length > 5) {
        console.log(`   ... and ${grades.length - 5} more grades`);
      }
    } else {
      console.log('   No grades found');
    }

    // Check Semesters
    console.log('\n📅 Semesters:');
    const semesters = await prisma.semester.findMany({
      orderBy: { semester: 'asc' }
    });
    console.log(`   Count: ${semesters.length}`);
    if (semesters.length > 0) {
      semesters.forEach(semester => {
        console.log(`   - ${semester.semester} (${semester.semesterCode})`);
      });
    } else {
      console.log('   No semesters found');
    }

    // Check Attendance
    console.log('\n✅ Attendance:');
    const attendance = await prisma.attendance.findMany({
      include: { student: true }
    });
    console.log(`   Count: ${attendance.length}`);
    if (attendance.length > 0) {
      attendance.slice(0, 5).forEach(record => {
        console.log(`   - ${record.student.firstName} ${record.student.lastName}: ${record.status} on ${record.date.toDateString()} (${record.session})`);
      });
      if (attendance.length > 5) {
        console.log(`   ... and ${attendance.length - 5} more attendance records`);
      }
    } else {
      console.log('   No attendance records found');
    }

    // Check Users
    console.log('\n👤 Users:');
    const users = await prisma.user.findMany({
      orderBy: { username: 'asc' }
    });
    console.log(`   Count: ${users.length}`);
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.firstname} ${user.lastname}) - ${user.role}`);
      });
    } else {
      console.log('   No users found');
    }

    // Summary
    console.log('\n🎉 Database Verification Complete!');
    console.log('\n📊 Summary:');
    console.log(`   - School Years: ${schoolYears.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Subjects: ${subjects.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Guardians: ${guardians.length}`);
    console.log(`   - Family Info: ${familyInfo.length}`);
    console.log(`   - Enrollments: ${enrollments.length}`);
    console.log(`   - Grades: ${grades.length}`);
    console.log(`   - Semesters: ${semesters.length}`);
    console.log(`   - Attendance: ${attendance.length}`);
    console.log(`   - Users: ${users.length}`);

  } catch (error) {
    console.error('❌ Error during database verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyCompleteDatabase();
