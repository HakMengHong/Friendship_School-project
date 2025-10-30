#!/usr/bin/env node

/**
 * Manual Data Restore Script
 * 
 * This script will manually insert the data from the backup file
 * using Prisma ORM instead of raw SQL execution
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample data from the backup file
const sampleData = {
  users: [
    {
      userId: 1,
      username: "admin",
      password: "$2b$10$1ywup3Vl4Kkz2uJWCrgO7uI5Rpuf64Cdvcwd39LJg4MkzI5oEMAkm",
      lastname: "User",
      firstname: "Admin",
      phonenumber1: "012345678",
      role: "admin",
      avatar: "AU",
      position: "System Administrator",
      status: "active"
    },
    {
      userId: 2,
      username: "យឿនសុខរ៉ែន",
      password: "$2b$10$Oiu/Pcl6ee27SjtKggJkz.DhTukoXLszWmXk1CbFmDAQO2MfdOzOa",
      lastname: "យឿន",
      firstname: "សុខរ៉ែន",
      phonenumber1: "0123456789",
      role: "teacher",
      avatar: "សយ",
      position: "គ្រូបន្ទុកថ្នាក់ទី ១",
      status: "active"
    },
    {
      userId: 11,
      username: "ស្រូយស៊ីណាត",
      password: "$2b$10$KGNSdueICrG23m23A1PBf.j4P7dNhC.xIEZg2cL1KDUs4y17FA5I2",
      lastname: "ស្រូយ",
      firstname: "ស៊ីណាត",
      phonenumber1: "0123456789",
      role: "admin",
      avatar: "សស",
      position: "នាយិកា",
      status: "active"
    }
  ],
  
  schoolYears: [
    {
      schoolYearId: 1,
      schoolYearCode: "2025-2026"
    }
  ],
  
  courses: [
    {
      courseId: 1,
      schoolYearId: 1,
      teacherId1: 10,
      grade: "9",
      section: "A",
      courseName: "ថ្នាក់ទី 9"
    },
    {
      courseId: 2,
      schoolYearId: 1,
      teacherId1: 2,
      grade: "1",
      section: "A",
      courseName: "ថ្នាក់ទី 1"
    },
    {
      courseId: 7,
      schoolYearId: 1,
      grade: "6",
      section: "A",
      courseName: "ថ្នាក់ទី 6"
    },
    {
      courseId: 8,
      schoolYearId: 1,
      grade: "7",
      section: "A",
      courseName: "ថ្នាក់ទី 7"
    },
    {
      courseId: 9,
      schoolYearId: 1,
      grade: "8",
      section: "A",
      courseName: "ថ្នាក់ទី 8"
    }
  ],
  
  students: [
    {
      studentId: 1003,
      lastName: "ទាន់",
      firstName: "លីងយូឈីង",
      gender: "female",
      dob: new Date("2015-07-27"),
      class: "5",
      phone: "0889407568",
      status: "active",
      schoolYear: "2025-2026"
    },
    {
      studentId: 1004,
      lastName: "ស៊ីម",
      firstName: "ឃុនសួយ",
      gender: "male",
      dob: new Date("2019-10-28"),
      class: "1",
      phone: "010 62 72 65",
      status: "active",
      schoolYear: "2025-2026"
    },
    {
      studentId: 1005,
      lastName: "ផុស",
      firstName: "សុផានា",
      gender: "male",
      dob: new Date("2014-10-01"),
      class: "7",
      phone: "089508182",
      status: "active",
      schoolYear: "2025-2026"
    },
    {
      studentId: 1006,
      lastName: "រិទ្ធ",
      firstName: "បូរី",
      gender: "male",
      dob: new Date("2016-04-19"),
      class: "5",
      phone: "0968694630",
      status: "active",
      schoolYear: "2025-2026"
    },
    {
      studentId: 1007,
      lastName: "រិទ្ធ",
      firstName: "បូរិន",
      gender: "male",
      dob: new Date("2018-07-05"),
      class: "1",
      phone: "096 86 94 63",
      status: "active",
      schoolYear: "2025-2026"
    }
  ],
  
  enrollments: [
    { enrollmentId: 1, courseId: 1, studentId: 1091, drop: false },
    { enrollmentId: 2, courseId: 1, studentId: 1095, drop: false },
    { enrollmentId: 3, courseId: 1, studentId: 1134, drop: false },
    { enrollmentId: 4, courseId: 1, studentId: 1093, drop: false },
    { enrollmentId: 5, courseId: 1, studentId: 1088, drop: false }
  ]
};

async function restoreData() {
  console.log('🚀 Starting manual data restore...');
  
  try {
    // Restore Users
    console.log('👥 Restoring users...');
    for (const user of sampleData.users) {
      await prisma.user.create({
        data: user
      });
    }
    console.log(`✅ Restored ${sampleData.users.length} users`);
    
    // Restore School Years
    console.log('📅 Restoring school years...');
    for (const schoolYear of sampleData.schoolYears) {
      await prisma.schoolYear.create({
        data: schoolYear
      });
    }
    console.log(`✅ Restored ${sampleData.schoolYears.length} school years`);
    
    // Restore Courses
    console.log('📚 Restoring courses...');
    for (const course of sampleData.courses) {
      await prisma.course.create({
        data: course
      });
    }
    console.log(`✅ Restored ${sampleData.courses.length} courses`);
    
    // Restore Students
    console.log('🎓 Restoring students...');
    for (const student of sampleData.students) {
      await prisma.student.create({
        data: student
      });
    }
    console.log(`✅ Restored ${sampleData.students.length} students`);
    
    // Restore Enrollments
    console.log('📝 Restoring enrollments...');
    for (const enrollment of sampleData.enrollments) {
      await prisma.enrollment.create({
        data: enrollment
      });
    }
    console.log(`✅ Restored ${sampleData.enrollments.length} enrollments`);
    
    // Verify restore
    console.log('🔍 Verifying restore...');
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const courseCount = await prisma.course.count();
    const schoolYearCount = await prisma.schoolYear.count();
    const enrollmentCount = await prisma.enrollment.count();
    
    console.log('📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Courses: ${courseCount}`);
    console.log(`   School Years: ${schoolYearCount}`);
    console.log(`   Enrollments: ${enrollmentCount}`);
    
    console.log('🎉 Manual data restore completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Test your application to ensure everything works');
    console.log('   2. Check that all data is properly restored');
    console.log('   3. Verify user authentication and permissions');
    
  } catch (error) {
    console.error('💥 Manual data restore failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  restoreData();
}

module.exports = { restoreData };
