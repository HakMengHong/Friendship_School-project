#!/usr/bin/env node

/**
 * Database Restore Script using Prisma
 * 
 * This script will:
 * 1. Clear all existing data from the database using Prisma
 * 2. Restore data from the backup SQL file using raw SQL execution
 * 
 * Usage: node scripts/restore-database-prisma.js [backup-file]
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Clear all data from database using Prisma
async function clearDatabase() {
  console.log('🧹 Clearing existing database data...');
  
  try {
    // Clear tables in correct order (respecting foreign key constraints)
    // First clear dependent tables
    console.log('   Clearing Grade table...');
    await prisma.grade.deleteMany();
    
    console.log('   Clearing Attendance table...');
    await prisma.attendance.deleteMany();
    
    console.log('   Clearing Enrollment table...');
    await prisma.enrollment.deleteMany();
    
    // Clear student-related tables
    console.log('   Clearing Guardian table...');
    await prisma.guardian.deleteMany();
    
    console.log('   Clearing FamilyInfo table...');
    await prisma.familyInfo.deleteMany();
    
    console.log('   Clearing Scholarship table...');
    await prisma.scholarship.deleteMany();
    
    // Clear main tables
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
    
    // Reset sequences
    console.log('   Resetting sequences...');
    await prisma.$executeRaw`ALTER SEQUENCE "User_userId_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Student_studentId_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Course_courseId_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Subject_subjectId_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Semester_semesterId_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "SchoolYear_schoolYearId_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Enrollment_enrollmentId_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Grade_gradeId_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Attendance_attendanceId_seq" RESTART WITH 1;`;
    
    console.log('✅ Database cleared successfully');
    
  } catch (error) {
    console.error('❌ Failed to clear database:', error.message);
    throw error;
  }
}

// Restore database from backup file
async function restoreDatabase(backupFile) {
  console.log(`📥 Restoring database from: ${backupFile}`);
  
  try {
    // Read the backup file
    const backupContent = fs.readFileSync(backupFile, 'utf8');
    
    // Split the content into individual SQL statements
    const statements = backupContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('\\'));
    
    console.log(`   Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let executed = 0;
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          executed++;
          
          if (executed % 10 === 0) {
            console.log(`   Executed ${executed} statements...`);
          }
        } catch (error) {
          // Skip statements that might cause errors (like CREATE DATABASE, etc.)
          if (!error.message.includes('already exists') && 
              !error.message.includes('does not exist') &&
              !error.message.includes('permission denied')) {
            console.warn(`   Warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`✅ Database restored successfully (${executed} statements executed)`);
    
  } catch (error) {
    console.error('❌ Failed to restore database:', error.message);
    throw error;
  }
}

// Verify database restore
async function verifyRestore() {
  console.log('🔍 Verifying database restore...');
  
  try {
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const courseCount = await prisma.course.count();
    const subjectCount = await prisma.subject.count();
    const semesterCount = await prisma.semester.count();
    const schoolYearCount = await prisma.schoolYear.count();
    const enrollmentCount = await prisma.enrollment.count();
    const gradeCount = await prisma.grade.count();
    const attendanceCount = await prisma.attendance.count();
    
    console.log('📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Courses: ${courseCount}`);
    console.log(`   Subjects: ${subjectCount}`);
    console.log(`   Semesters: ${semesterCount}`);
    console.log(`   School Years: ${schoolYearCount}`);
    console.log(`   Enrollments: ${enrollmentCount}`);
    console.log(`   Grades: ${gradeCount}`);
    console.log(`   Attendance: ${attendanceCount}`);
    
    if (userCount > 0 || studentCount > 0) {
      console.log('✅ Database restore verification successful!');
    } else {
      console.log('⚠️ Warning: No data found in database after restore');
    }
    
  } catch (error) {
    console.error('❌ Failed to verify database restore:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting database restore process...');
    
    // Get backup file from command line argument or use the latest one
    const backupFile = process.argv[2];
    let selectedBackupFile;
    
    if (backupFile) {
      if (!fs.existsSync(backupFile)) {
        throw new Error(`Backup file not found: ${backupFile}`);
      }
      selectedBackupFile = backupFile;
    } else {
      // Use the latest backup file
      const backupDir = 'backup';
      if (!fs.existsSync(backupDir)) {
        throw new Error('Backup directory not found');
      }
      
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.sql'))
        .map(file => ({
          name: file,
          path: path.join(backupDir, file),
          stats: fs.statSync(path.join(backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);
      
      if (backupFiles.length === 0) {
        throw new Error('No backup files found in backup directory');
      }
      
      selectedBackupFile = backupFiles[0].path;
      console.log(`📁 Using latest backup file: ${selectedBackupFile}`);
    }
    
    // Step 1: Clear existing data
    await clearDatabase();
    
    // Step 2: Restore from backup
    await restoreDatabase(selectedBackupFile);
    
    // Step 3: Verify restore
    await verifyRestore();
    
    console.log('🎉 Database restore completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Test your application to ensure everything works');
    console.log('   2. Check that all data is properly restored');
    console.log('   3. Verify user authentication and permissions');
    
  } catch (error) {
    console.error('💥 Database restore failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { clearDatabase, restoreDatabase, verifyRestore };
