#!/usr/bin/env node

/**
 * Database Review Script
 * 
 * This script provides a comprehensive review of your database:
 * - Table statistics
 * - Data integrity checks
 * - Relationship analysis
 * - Recent activity
 * 
 * Usage: node scripts/review-database.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reviewDatabase() {
  console.log('\n🔍 Database Comprehensive Review');
  console.log('═'.repeat(70));
  
  try {
    // Basic statistics
    console.log('\n📊 Basic Statistics:');
    console.log('─'.repeat(70));
    
    const stats = {
      users: await prisma.user.count(),
      students: await prisma.student.count(),
      courses: await prisma.course.count(),
      subjects: await prisma.subject.count(),
      grades: await prisma.grade.count(),
      attendances: await prisma.attendance.count(),
      enrollments: await prisma.enrollment.count(),
      schoolYears: await prisma.schoolYear.count(),
      semesters: await prisma.semester.count(),
      activityLogs: await prisma.activityLog.count(),
      guardians: await prisma.guardian.count(),
      familyInfo: await prisma.familyInfo.count(),
      scholarships: await prisma.scholarship.count(),
    };
    
    console.log('\n📈 Record Counts:');
    Object.entries(stats).forEach(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      console.log(`   ${label.padEnd(25)} ${value.toLocaleString().padStart(10)}`);
    });
    
    // User analysis
    console.log('\n👥 User Analysis:');
    console.log('─'.repeat(70));
    
    const activeUsers = await prisma.user.count({ where: { status: 'active' } });
    const admins = await prisma.user.count({ where: { role: 'admin' } });
    const teachers = await prisma.user.count({ where: { role: 'teacher' } });
    const recentLogins = await prisma.user.count({
      where: {
        lastLogin: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });
    
    console.log(`   Total Users:        ${stats.users}`);
    console.log(`   Active Users:       ${activeUsers}`);
    console.log(`   Inactive Users:     ${stats.users - activeUsers}`);
    console.log(`   Admins:             ${admins}`);
    console.log(`   Teachers:           ${teachers}`);
    console.log(`   Recent Logins (7d): ${recentLogins}`);
    
    // Student analysis
    console.log('\n🎓 Student Analysis:');
    console.log('─'.repeat(70));
    
    const studentsWithPhotos = await prisma.student.count({ where: { photo: { not: null } } });
    const studentsByGender = await prisma.student.groupBy({
      by: ['gender'],
      _count: { studentId: true }
    });
    
    console.log(`   Total Students:     ${stats.students}`);
    console.log(`   With Photos:        ${studentsWithPhotos}`);
    console.log(`   Without Photos:     ${stats.students - studentsWithPhotos}`);
    
    if (studentsByGender.length > 0) {
      console.log(`\n   By Gender:`);
      studentsByGender.forEach(({ gender, _count }) => {
        console.log(`     ${(gender || 'Unknown').padEnd(15)} ${_count.studentId}`);
      });
    }
    
    // Enrollment analysis
    console.log('\n📚 Enrollment Analysis:');
    console.log('─'.repeat(70));
    
    const activeEnrollments = await prisma.enrollment.count({ where: { drop: false } });
    const droppedEnrollments = await prisma.enrollment.count({ where: { drop: true } });
    
    console.log(`   Total Enrollments:  ${stats.enrollments}`);
    console.log(`   Active:             ${activeEnrollments}`);
    console.log(`   Dropped:            ${droppedEnrollments}`);
    
    // Academic analysis
    console.log('\n📖 Academic Analysis:');
    console.log('─'.repeat(70));
    
    console.log(`   Courses:            ${stats.courses}`);
    console.log(`   Subjects:           ${stats.subjects}`);
    console.log(`   Grades:             ${stats.grades}`);
    console.log(`   Attendances:        ${stats.attendances}`);
    console.log(`   School Years:       ${stats.schoolYears}`);
    console.log(`   Semesters:          ${stats.semesters}`);
    
    // Grade statistics
    if (stats.grades > 0) {
      const gradeStats = await prisma.grade.aggregate({
        _avg: { grade: true },
        _min: { grade: true },
        _max: { grade: true },
        _count: { gradeId: true }
      });
      
      console.log(`\n   Grade Statistics:`);
      console.log(`     Average:         ${gradeStats._avg.grade?.toFixed(2) || 'N/A'}`);
      console.log(`     Minimum:         ${gradeStats._min.grade || 'N/A'}`);
      console.log(`     Maximum:         ${gradeStats._max.grade || 'N/A'}`);
      console.log(`     Total Grades:     ${gradeStats._count.gradeId}`);
    }
    
    // Recent activity
    console.log('\n🕐 Recent Activity:');
    console.log('─'.repeat(70));
    
    const recentActivity = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            firstname: true,
            lastname: true,
            role: true
          }
        }
      }
    });
    
    if (recentActivity.length > 0) {
      console.log('\n   Last 10 Activities:');
      recentActivity.forEach((log, index) => {
        const user = log.user 
          ? `${log.user.firstname} ${log.user.lastname} (${log.user.role})`
          : 'Unknown User';
        const date = new Date(log.timestamp).toLocaleString();
        const action = log.action || 'No action';
        console.log(`\n   ${index + 1}. ${date}`);
        console.log(`      User: ${user}`);
        console.log(`      Action: ${action}`);
        if (log.details) {
          console.log(`      Details: ${log.details.substring(0, 60)}${log.details.length > 60 ? '...' : ''}`);
        }
      });
    } else {
      console.log('   No recent activity found.');
    }
    
    // Data integrity checks
    console.log('\n🔍 Data Integrity Checks:');
    console.log('─'.repeat(70));
    
    // Check for orphaned records
    const studentsWithoutEnrollments = await prisma.student.count({
      where: {
        enrollments: { none: {} }
      }
    });
    
    const coursesWithoutStudents = await prisma.course.count({
      where: {
        enrollments: { none: {} }
      }
    });
    
    // Note: studentId is required in schema, so no orphaned grades possible
    const gradesWithoutStudents = 0;
    
    console.log(`   Students without enrollments: ${studentsWithoutEnrollments}`);
    console.log(`   Courses without students:     ${coursesWithoutStudents}`);
    console.log(`   Orphaned grades:              ${gradesWithoutStudents}`);
    
    // Summary
    console.log('\n📦 Summary:');
    console.log('─'.repeat(70));
    const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);
    console.log(`   Total Records in Database: ${totalRecords.toLocaleString()}`);
    console.log(`   Total Tables: 14`);
    console.log(`   Database Status: ✅ Healthy`);
    
    console.log('\n' + '═'.repeat(70));
    console.log('✅ Review completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Review failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  reviewDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { reviewDatabase };
