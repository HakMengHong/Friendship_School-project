const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🗑️  Database Cleaning Tool');
  console.log('========================\n');

  try {
    // Check current data counts
    console.log('📊 Current Database Statistics:');
    console.log('-------------------------------');
    
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const courseCount = await prisma.course.count();
    const gradeCount = await prisma.grade.count();
    const enrollmentCount = await prisma.enrollment.count();
    const attendanceCount = await prisma.attendance.count();
    const guardianCount = await prisma.guardian.count();
    const familyInfoCount = await prisma.familyInfo.count();
    const scholarshipCount = await prisma.scholarship.count();
    const schoolYearCount = await prisma.schoolYear.count();
    const semesterCount = await prisma.semester.count();
    const subjectCount = await prisma.subject.count();
    const activityLogCount = await prisma.activityLog.count();
    const announcementCount = await prisma.announcement.count();

    console.log(`👥 Users: ${userCount}`);
    console.log(`👨‍🎓 Students: ${studentCount}`);
    console.log(`📚 Courses: ${courseCount}`);
    console.log(`📊 Grades: ${gradeCount}`);
    console.log(`📝 Enrollments: ${enrollmentCount}`);
    console.log(`📅 Attendance: ${attendanceCount}`);
    console.log(`👨‍👩‍👧‍👦 Guardians: ${guardianCount}`);
    console.log(`🏠 Family Info: ${familyInfoCount}`);
    console.log(`💰 Scholarships: ${scholarshipCount}`);
    console.log(`📅 School Years: ${schoolYearCount}`);
    console.log(`📚 Semesters: ${semesterCount}`);
    console.log(`📖 Subjects: ${subjectCount}`);
    console.log(`📋 Activity Logs: ${activityLogCount}`);
    console.log(`📢 Announcements: ${announcementCount}\n`);

    // Ask user what to clean
    console.log('🧹 What would you like to clean?');
    console.log('1. All data (complete reset)');
    console.log('2. Student-related data only');
    console.log('3. Academic data only (grades, enrollments, attendance)');
    console.log('4. User data only');
    console.log('5. Specific table');
    console.log('6. Exit without cleaning\n');

    // For demonstration, let's clean academic data (option 3)
    const choice = 3; // You can change this or make it interactive
    
    switch (choice) {
      case 1:
        await cleanAllData();
        break;
      case 2:
        await cleanStudentData();
        break;
      case 3:
        await cleanAcademicData();
        break;
      case 4:
        await cleanUserData();
        break;
      case 5:
        await cleanSpecificTable();
        break;
      case 6:
        console.log('✅ Exiting without cleaning data');
        break;
      default:
        console.log('❌ Invalid choice');
    }

  } catch (error) {
    console.error('❌ Error during database cleaning:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanAllData() {
  console.log('🗑️  Cleaning ALL data...');
  
  try {
    // Delete in reverse order of dependencies
    await prisma.grade.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.guardian.deleteMany();
    await prisma.familyInfo.deleteMany();
    await prisma.scholarship.deleteMany();
    await prisma.student.deleteMany();
    await prisma.course.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.semester.deleteMany();
    await prisma.schoolYear.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ All data has been cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning all data:', error);
  }
}

async function cleanStudentData() {
  console.log('🗑️  Cleaning student-related data...');
  
  try {
    // Delete student-related data
    await prisma.grade.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.guardian.deleteMany();
    await prisma.familyInfo.deleteMany();
    await prisma.scholarship.deleteMany();
    await prisma.student.deleteMany();

    console.log('✅ Student-related data has been cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning student data:', error);
  }
}

async function cleanAcademicData() {
  console.log('🗑️  Cleaning academic data...');
  
  try {
    // Delete academic-related data
    await prisma.grade.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.course.deleteMany();

    console.log('✅ Academic data has been cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning academic data:', error);
  }
}

async function cleanUserData() {
  console.log('🗑️  Cleaning user data...');
  
  try {
    // Delete user data
    await prisma.user.deleteMany();
    await prisma.activityLog.deleteMany();

    console.log('✅ User data has been cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning user data:', error);
  }
}

async function cleanSpecificTable() {
  console.log('🗑️  Cleaning specific table...');
  
  try {
    // Example: Clean grades only
    const deletedGrades = await prisma.grade.deleteMany();
    console.log(`✅ Deleted ${deletedGrades.count} grades`);

    // Example: Clean enrollments only
    const deletedEnrollments = await prisma.enrollment.deleteMany();
    console.log(`✅ Deleted ${deletedEnrollments.count} enrollments`);

    // Example: Clean attendance only
    const deletedAttendance = await prisma.attendance.deleteMany();
    console.log(`✅ Deleted ${deletedAttendance.count} attendance records`);

    console.log('✅ Specific tables have been cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning specific tables:', error);
  }
}

// Run the cleaning tool
cleanDatabase();
