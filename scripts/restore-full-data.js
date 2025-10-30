#!/usr/bin/env node

/**
 * Full Data Restore Script
 * 
 * This script will extract and restore ALL data from the backup file
 * using a more comprehensive approach
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Clear all data from database
async function clearDatabase() {
  console.log('🧹 Clearing existing database data...');
  
  try {
    // Clear tables in correct order (respecting foreign key constraints)
    console.log('   Clearing Grade table...');
    await prisma.grade.deleteMany();
    
    console.log('   Clearing Attendance table...');
    await prisma.attendance.deleteMany();
    
    console.log('   Clearing Enrollment table...');
    await prisma.enrollment.deleteMany();
    
    console.log('   Clearing Guardian table...');
    await prisma.guardian.deleteMany();
    
    console.log('   Clearing FamilyInfo table...');
    await prisma.familyInfo.deleteMany();
    
    console.log('   Clearing Scholarship table...');
    await prisma.scholarship.deleteMany();
    
    console.log('   Clearing Student table...');
    await prisma.student.deleteMany();
    
    console.log('   Clearing Course table...');
    await prisma.course.deleteMany();
    
    console.log('   Clearing Subject table...');
    await prisma.subject.deleteMany();
    
    console.log('   Clearing Semester table...');
    await prisma.semester.deleteMany();
    
    console.log('   Clearing SchoolYear table...');
    await prisma.schoolYear.deleteMany();
    
    console.log('   Clearing ActivityLog table...');
    await prisma.activityLog.deleteMany();
    
    console.log('   Clearing User table...');
    await prisma.user.deleteMany();
    
    console.log('✅ Database cleared successfully');
    
  } catch (error) {
    console.error('❌ Failed to clear database:', error.message);
    throw error;
  }
}

// Parse data from backup file
function parseBackupData(backupFile) {
  console.log('📖 Reading backup file...');
  const content = fs.readFileSync(backupFile, 'utf8');
  
  const data = {
    users: [],
    schoolYears: [],
    courses: [],
    students: [],
    enrollments: [],
    familyInfo: [],
    guardians: [],
    subjects: [],
    semesters: [],
    grades: [],
    attendance: [],
    scholarships: [],
    activityLogs: []
  };
  
  // Parse Users
  console.log('   Parsing Users...');
  const userMatch = content.match(/COPY public\."User".*?FROM stdin;\n(.*?)\n\\\./s);
  if (userMatch) {
    const userLines = userMatch[1].trim().split('\n');
    for (const line of userLines) {
      if (line.trim()) {
        const parts = line.split('\t');
        data.users.push({
          userId: parseInt(parts[0]),
          username: parts[1],
          password: parts[2],
          lastname: parts[3],
          firstname: parts[4],
          phonenumber1: parts[5] === '\\N' ? null : parts[5],
          phonenumber2: parts[6] === '\\N' ? null : parts[6],
          role: parts[7],
          avatar: parts[8] === '\\N' ? null : parts[8],
          photo: parts[9] === '\\N' ? null : parts[9],
          position: parts[10] === '\\N' ? null : parts[10],
          status: parts[11],
          lastLogin: parts[12] === '\\N' ? null : new Date(parts[12]),
          createdAt: new Date(parts[13]),
          updatedAt: new Date(parts[14]),
          accountLockedUntil: parts[15] === '\\N' ? null : new Date(parts[15]),
          failedLoginAttempts: parseInt(parts[16]) || 0,
          lastFailedLogin: parts[17] === '\\N' ? null : new Date(parts[17])
        });
      }
    }
  }
  
  // Parse School Years
  console.log('   Parsing School Years...');
  const schoolYearMatch = content.match(/COPY public\."SchoolYear".*?FROM stdin;\n(.*?)\n\\\./s);
  if (schoolYearMatch) {
    const schoolYearLines = schoolYearMatch[1].trim().split('\n');
    for (const line of schoolYearLines) {
      if (line.trim()) {
        const parts = line.split('\t');
        data.schoolYears.push({
          schoolYearId: parseInt(parts[0]),
          schoolYearCode: parts[1],
          createdAt: new Date(parts[2]),
          updatedAt: new Date(parts[3])
        });
      }
    }
  }
  
  // Parse Courses
  console.log('   Parsing Courses...');
  const courseMatch = content.match(/COPY public\."Course".*?FROM stdin;\n(.*?)\n\\\./s);
  if (courseMatch) {
    const courseLines = courseMatch[1].trim().split('\n');
    for (const line of courseLines) {
      if (line.trim()) {
        const parts = line.split('\t');
        data.courses.push({
          courseId: parseInt(parts[0]),
          schoolYearId: parseInt(parts[1]),
          teacherId1: parts[2] === '\\N' ? null : parseInt(parts[2]),
          teacherId2: parts[3] === '\\N' ? null : parseInt(parts[3]),
          teacherId3: parts[4] === '\\N' ? null : parseInt(parts[4]),
          grade: parts[5],
          section: parts[6],
          courseName: parts[7],
          createdAt: new Date(parts[8]),
          updatedAt: new Date(parts[9])
        });
      }
    }
  }
  
  // Parse Students
  console.log('   Parsing Students...');
  const studentMatch = content.match(/COPY public\."Student".*?FROM stdin;\n(.*?)\n\\\./s);
  if (studentMatch) {
    const studentLines = studentMatch[1].trim().split('\n');
    for (const line of studentLines) {
      if (line.trim()) {
        const parts = line.split('\t');
        data.students.push({
          studentId: parseInt(parts[0]),
          lastName: parts[1],
          firstName: parts[2],
          gender: parts[3],
          dob: new Date(parts[4]),
          class: parts[5],
          photo: parts[6] === '\\N' ? null : parts[6],
          phone: parts[7] === '\\N' ? null : parts[7],
          registrationDate: parts[8] === '\\N' ? null : new Date(parts[8]),
          status: parts[9] === '\\N' ? null : parts[9],
          religion: parts[10] === '\\N' ? null : parts[10],
          health: parts[11] === '\\N' ? null : parts[11],
          emergencyContact: parts[12] === '\\N' ? null : parts[12],
          createdAt: new Date(parts[13]),
          updatedAt: new Date(parts[14]),
          classId: parts[15] === '\\N' ? null : parseInt(parts[15]),
          needsClothes: parts[16] === 't',
          needsMaterials: parts[17] === 't',
          needsTransport: parts[18] === 't',
          previousSchool: parts[19] === '\\N' ? null : parts[19],
          registerToStudy: parts[20] === 't',
          studentBirthDistrict: parts[21] === '\\N' ? null : parts[21],
          studentDistrict: parts[22] === '\\N' ? null : parts[22],
          studentHouseNumber: parts[23] === '\\N' ? null : parts[23],
          studentProvince: parts[24] === '\\N' ? null : parts[24],
          studentVillage: parts[25] === '\\N' ? null : parts[25],
          transferReason: parts[26] === '\\N' ? null : parts[26],
          vaccinated: parts[27] === 't',
          schoolYear: parts[28] === '\\N' ? null : parts[28],
          studentCommune: parts[29] === '\\N' ? null : parts[29]
        });
      }
    }
  }
  
  // Parse Enrollments
  console.log('   Parsing Enrollments...');
  const enrollmentMatch = content.match(/COPY public\."Enrollment".*?FROM stdin;\n(.*?)\n\\\./s);
  if (enrollmentMatch) {
    const enrollmentLines = enrollmentMatch[1].trim().split('\n');
    for (const line of enrollmentLines) {
      if (line.trim()) {
        const parts = line.split('\t');
        data.enrollments.push({
          enrollmentId: parseInt(parts[0]),
          courseId: parseInt(parts[1]),
          studentId: parseInt(parts[2]),
          drop: parts[3] === 't',
          dropDate: parts[4] === '\\N' ? null : new Date(parts[4]),
          createdAt: new Date(parts[5]),
          dropReason: parts[6] === '\\N' ? null : parts[6],
          updatedAt: new Date(parts[7]),
          dropSemesterId: parts[8] === '\\N' ? null : parseInt(parts[8])
        });
      }
    }
  }
  
  // Parse Family Info
  console.log('   Parsing Family Info...');
  const familyInfoMatch = content.match(/COPY public\."FamilyInfo".*?FROM stdin;\n(.*?)\n\\\./s);
  if (familyInfoMatch) {
    const familyInfoLines = familyInfoMatch[1].trim().split('\n');
    for (const line of familyInfoLines) {
      if (line.trim()) {
        const parts = line.split('\t');
        data.familyInfo.push({
          familyinfoId: parseInt(parts[0]),
          studentId: parseInt(parts[1]),
          createdAt: new Date(parts[2]),
          updatedAt: new Date(parts[3]),
          canHelpSchool: parts[4] === 't',
          churchName: parts[5] === '\\N' ? null : parts[5],
          durationInKPC: parts[6] === '\\N' ? null : parts[6],
          helpAmount: parts[7] === '\\N' ? null : parseFloat(parts[7]),
          helpFrequency: parts[8] === '\\N' ? null : parts[8],
          knowSchool: parts[9] === '\\N' ? null : parts[9],
          livingCondition: parts[10] === '\\N' ? null : parts[10],
          livingWith: parts[11] === '\\N' ? null : parts[11],
          organizationHelp: parts[12] === '\\N' ? null : parts[12],
          ownHouse: parts[13] === 't',
          religion: parts[14] === '\\N' ? null : parts[14],
          povertyCard: parts[15] === '\\N' ? null : parts[15]
        });
      }
    }
  }
  
  // Parse Guardians
  console.log('   Parsing Guardians...');
  const guardianMatch = content.match(/COPY public\."Guardian".*?FROM stdin;\n(.*?)\n\\\./s);
  if (guardianMatch) {
    const guardianLines = guardianMatch[1].trim().split('\n');
    for (const line of guardianLines) {
      if (line.trim()) {
        const parts = line.split('\t');
        data.guardians.push({
          guardianId: parseInt(parts[0]),
          studentId: parseInt(parts[1]),
          relation: parts[2],
          phone: parts[3] === '\\N' ? null : parts[3],
          createdAt: new Date(parts[4]),
          updatedAt: new Date(parts[5]),
          believeJesus: parts[6] === 't',
          birthDistrict: parts[7] === '\\N' ? null : parts[7],
          childrenCount: parts[8] === '\\N' ? null : parseInt(parts[8]),
          church: parts[9] === '\\N' ? null : parts[9],
          district: parts[10] === '\\N' ? null : parts[10],
          firstName: parts[11] === '\\N' ? null : parts[11],
          houseNumber: parts[12] === '\\N' ? null : parts[12],
          income: parts[13] === '\\N' ? null : parseFloat(parts[13]),
          lastName: parts[14] === '\\N' ? null : parts[14],
          occupation: parts[15] === '\\N' ? null : parts[15],
          province: parts[16] === '\\N' ? null : parts[16],
          village: parts[17] === '\\N' ? null : parts[17],
          commune: parts[18] === '\\N' ? null : parts[18]
        });
      }
    }
  }
  
  console.log(`📊 Parsed data counts:`);
  console.log(`   Users: ${data.users.length}`);
  console.log(`   School Years: ${data.schoolYears.length}`);
  console.log(`   Courses: ${data.courses.length}`);
  console.log(`   Students: ${data.students.length}`);
  console.log(`   Enrollments: ${data.enrollments.length}`);
  console.log(`   Family Info: ${data.familyInfo.length}`);
  console.log(`   Guardians: ${data.guardians.length}`);
  
  return data;
}

// Restore all data
async function restoreAllData(data) {
  console.log('🚀 Starting full data restore...');
  
  try {
    // Restore Users
    console.log('👥 Restoring users...');
    for (const user of data.users) {
      await prisma.user.create({ data: user });
    }
    console.log(`✅ Restored ${data.users.length} users`);
    
    // Restore School Years
    console.log('📅 Restoring school years...');
    for (const schoolYear of data.schoolYears) {
      await prisma.schoolYear.create({ data: schoolYear });
    }
    console.log(`✅ Restored ${data.schoolYears.length} school years`);
    
    // Restore Courses
    console.log('📚 Restoring courses...');
    for (const course of data.courses) {
      await prisma.course.create({ data: course });
    }
    console.log(`✅ Restored ${data.courses.length} courses`);
    
    // Restore Students
    console.log('🎓 Restoring students...');
    for (const student of data.students) {
      await prisma.student.create({ data: student });
    }
    console.log(`✅ Restored ${data.students.length} students`);
    
    // Restore Enrollments
    console.log('📝 Restoring enrollments...');
    for (const enrollment of data.enrollments) {
      await prisma.enrollment.create({ data: enrollment });
    }
    console.log(`✅ Restored ${data.enrollments.length} enrollments`);
    
    // Restore Family Info
    console.log('👨‍👩‍👧‍👦 Restoring family info...');
    for (const familyInfo of data.familyInfo) {
      await prisma.familyInfo.create({ data: familyInfo });
    }
    console.log(`✅ Restored ${data.familyInfo.length} family info records`);
    
    // Restore Guardians
    console.log('👨‍👩‍👧‍👦 Restoring guardians...');
    for (const guardian of data.guardians) {
      await prisma.guardian.create({ data: guardian });
    }
    console.log(`✅ Restored ${data.guardians.length} guardians`);
    
    // Verify restore
    console.log('🔍 Verifying restore...');
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const courseCount = await prisma.course.count();
    const schoolYearCount = await prisma.schoolYear.count();
    const enrollmentCount = await prisma.enrollment.count();
    const familyInfoCount = await prisma.familyInfo.count();
    const guardianCount = await prisma.guardian.count();
    
    console.log('📊 Final Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Courses: ${courseCount}`);
    console.log(`   School Years: ${schoolYearCount}`);
    console.log(`   Enrollments: ${enrollmentCount}`);
    console.log(`   Family Info: ${familyInfoCount}`);
    console.log(`   Guardians: ${guardianCount}`);
    
    console.log('🎉 Full data restore completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Test your application to ensure everything works');
    console.log('   2. Check that all data is properly restored');
    console.log('   3. Verify user authentication and permissions');
    
  } catch (error) {
    console.error('💥 Data restore failed:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting full database restore process...');
    
    // Step 1: Clear existing data
    await clearDatabase();
    
    // Step 2: Parse backup data
    const backupFile = 'backup/friendship_school_backup_20251023_154032.sql';
    const data = parseBackupData(backupFile);
    
    // Step 3: Restore all data
    await restoreAllData(data);
    
  } catch (error) {
    console.error('💥 Full restore failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { clearDatabase, parseBackupData, restoreAllData };
