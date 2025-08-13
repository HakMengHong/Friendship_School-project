const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickClean() {
  console.log('🧹 Quick Database Clean');
  console.log('=======================\n');

  try {
    // Clean test/development data
    console.log('🗑️  Cleaning test data...');
    
    // Clean grades (most common to clean)
    const deletedGrades = await prisma.grade.deleteMany();
    console.log(`✅ Deleted ${deletedGrades.count} grades`);
    
    // Clean enrollments
    const deletedEnrollments = await prisma.enrollment.deleteMany();
    console.log(`✅ Deleted ${deletedEnrollments.count} enrollments`);
    
    // Clean attendance records
    const deletedAttendance = await prisma.attendance.deleteMany();
    console.log(`✅ Deleted ${deletedAttendance.count} attendance records`);
    
    // Clean activity logs
    const deletedLogs = await prisma.activityLog.deleteMany();
    console.log(`✅ Deleted ${deletedLogs.count} activity logs`);
    
    // Clean announcements
    const deletedAnnouncements = await prisma.announcement.deleteMany();
    console.log(`✅ Deleted ${deletedAnnouncements.count} announcements`);
    
    console.log('\n✅ Quick clean completed successfully!');
    
    // Show remaining data
    console.log('\n📊 Remaining Data:');
    console.log('-------------------');
    const remainingGrades = await prisma.grade.count();
    const remainingStudents = await prisma.student.count();
    const remainingUsers = await prisma.user.count();
    const remainingCourses = await prisma.course.count();
    
    console.log(`📊 Grades: ${remainingGrades}`);
    console.log(`👨‍🎓 Students: ${remainingStudents}`);
    console.log(`👥 Users: ${remainingUsers}`);
    console.log(`📚 Courses: ${remainingCourses}`);

  } catch (error) {
    console.error('❌ Error during quick clean:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run quick clean
quickClean();
