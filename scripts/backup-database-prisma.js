#!/usr/bin/env node

/**
 * Database Backup Script (Prisma-based)
 * 
 * This script creates a database backup using Prisma instead of pg_dump
 * It exports all data to SQL format and saves it to backup/ directory
 * 
 * Usage: node scripts/backup-database-prisma.js
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Generate SQL INSERT statements
function generateInsertSQL(tableName, columns, rows) {
  if (rows.length === 0) return '';
  
  const sqlStatements = [];
  const batchSize = 100; // Insert in batches of 100
  
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values = batch.map(row => {
      const rowValues = columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'string') {
          return `'${value.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
        }
        if (value instanceof Date) {
          return `'${value.toISOString()}'`;
        }
        if (typeof value === 'boolean') {
          return value ? 'true' : 'false';
        }
        return String(value);
      });
      return `(${rowValues.join(', ')})`;
    });
    
    sqlStatements.push(`INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES\n${values.join(',\n')};`);
  }
  
  return sqlStatements.join('\n\n');
}

// Get all data from a table
async function getTableData(tableName, model) {
  try {
    const data = await model.findMany();
    return data;
  } catch (error) {
    console.warn(`   ⚠️  Could not fetch ${tableName}: ${error.message}`);
    return [];
  }
}

// Create backup using Prisma
async function createBackup() {
  console.log('\n💾 Starting Database Backup (Prisma Method)');
  console.log('═'.repeat(60));
  
  try {
    // Create backup directory
    const backupDir = path.join(process.cwd(), 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Generate timestamp
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const backupFileName = `friendship_school_backup_${dateStr}.sql`;
    const backupFilePath = path.join(backupDir, backupFileName);
    
    console.log(`📝 Backup file: ${backupFileName}`);
    console.log(`📂 Full path: ${backupFilePath}`);
    
    // Start building SQL file
    let sqlContent = `-- Friendship School Database Backup\n`;
    sqlContent += `-- Generated: ${now.toISOString()}\n`;
    sqlContent += `-- Total Records: Will be calculated\n\n`;
    sqlContent += `-- ============================================\n`;
    sqlContent += `-- Backup Started\n`;
    sqlContent += `-- ============================================\n\n`;
    
    // Disable foreign key checks
    sqlContent += `SET session_replication_role = replica;\n\n`;
    
    let totalRecords = 0;
    
    // Backup each table in correct order (respecting foreign keys)
    const tables = [
      { name: 'User', model: prisma.user, columns: ['userId', 'username', 'password', 'lastname', 'firstname', 'phonenumber1', 'phonenumber2', 'role', 'avatar', 'photo', 'position', 'status', 'lastLogin', 'createdAt', 'updatedAt', 'accountLockedUntil', 'failedLoginAttempts', 'lastFailedLogin'] },
      { name: 'SchoolYear', model: prisma.schoolYear, columns: ['schoolYearId', 'schoolYearCode', 'createdAt', 'updatedAt'] },
      { name: 'Semester', model: prisma.semester, columns: ['semesterId', 'semester', 'semesterCode', 'createdAt', 'updatedAt'] },
      { name: 'Subject', model: prisma.subject, columns: ['subjectId', 'subjectName', 'createdAt', 'updatedAt'] },
      { name: 'Course', model: prisma.course, columns: ['courseId', 'schoolYearId', 'teacherId1', 'teacherId2', 'teacherId3', 'grade', 'section', 'courseName', 'createdAt', 'updatedAt'] },
      { name: 'Student', model: prisma.student, columns: ['studentId', 'lastName', 'firstName', 'gender', 'dob', 'class', 'photo', 'phone', 'registrationDate', 'status', 'religion', 'health', 'emergencyContact', 'createdAt', 'updatedAt', 'classId', 'needsClothes', 'needsMaterials', 'needsTransport', 'previousSchool', 'registerToStudy', 'studentBirthDistrict', 'studentDistrict', 'studentHouseNumber', 'studentProvince', 'studentVillage', 'transferReason', 'vaccinated', 'schoolYear', 'studentCommune'] },
      { name: 'Guardian', model: prisma.guardian, columns: ['guardianId', 'studentId', 'relation', 'phone', 'createdAt', 'updatedAt', 'believeJesus', 'birthDistrict', 'childrenCount', 'church', 'district', 'firstName', 'houseNumber', 'income', 'lastName', 'occupation', 'province', 'village', 'commune'] },
      { name: 'FamilyInfo', model: prisma.familyInfo, columns: ['familyinfoId', 'studentId', 'createdAt', 'updatedAt', 'canHelpSchool', 'churchName', 'durationInKPC', 'helpAmount', 'helpFrequency', 'knowSchool', 'livingCondition', 'livingWith', 'organizationHelp', 'ownHouse', 'religion', 'povertyCard'] },
      { name: 'Scholarship', model: prisma.scholarship, columns: ['scholarshipId', 'studentId', 'type', 'amount', 'sponsor', 'createdAt', 'updatedAt'] },
      { name: 'Enrollment', model: prisma.enrollment, columns: ['enrollmentId', 'courseId', 'studentId', 'drop', 'dropSemesterId', 'dropDate', 'dropReason', 'createdAt', 'updatedAt'] },
      { name: 'Grade', model: prisma.grade, columns: ['gradeId', 'courseId', 'studentId', 'subjectId', 'semesterId', 'gradeDate', 'grade', 'gradeComment', 'userId', 'lastEdit', 'createdAt', 'updatedAt'] },
      { name: 'Attendance', model: prisma.attendance, columns: ['attendanceId', 'studentId', 'session', 'status', 'reason', 'recordedBy', 'createdAt', 'updatedAt', 'attendanceDate', 'courseId', 'semesterId', 'schoolYearId'] },
      { name: 'ActivityLog', model: prisma.activityLog, columns: ['id', 'userId', 'action', 'details', 'timestamp'] },
    ];
    
    console.log(`\n📦 Exporting data from ${tables.length} tables...\n`);
    
    for (const table of tables) {
      console.log(`   📋 Exporting ${table.name}...`);
      const data = await getTableData(table.name, table.model);
      totalRecords += data.length;
      
      if (data.length > 0) {
        // Only include columns that exist in the data
        const availableColumns = table.columns.filter(col => 
          data.some(row => row.hasOwnProperty(col))
        );
        
        const insertSQL = generateInsertSQL(table.name, availableColumns, data);
        if (insertSQL) {
          sqlContent += `-- ============================================\n`;
          sqlContent += `-- Table: ${table.name} (${data.length} records)\n`;
          sqlContent += `-- ============================================\n\n`;
          sqlContent += `TRUNCATE TABLE "${table.name}" CASCADE;\n\n`;
          sqlContent += insertSQL;
          sqlContent += `\n\n`;
        }
        console.log(`      ✅ Exported ${data.length} records`);
      } else {
        console.log(`      ℹ️  No records in ${table.name}`);
        sqlContent += `-- Table: ${table.name} (0 records)\n`;
        sqlContent += `TRUNCATE TABLE "${table.name}" CASCADE;\n\n`;
      }
    }
    
    // Re-enable foreign key checks
    sqlContent += `-- ============================================\n`;
    sqlContent += `-- Re-enable foreign key checks\n`;
    sqlContent += `-- ============================================\n\n`;
    sqlContent += `SET session_replication_role = DEFAULT;\n\n`;
    sqlContent += `-- ============================================\n`;
    sqlContent += `-- Backup Completed\n`;
    sqlContent += `-- Total Records: ${totalRecords.toLocaleString()}\n`;
    sqlContent += `-- ============================================\n`;
    
    // Write to file
    fs.writeFileSync(backupFilePath, sqlContent, 'utf8');
    
    // Get file stats
    const stats = fs.statSync(backupFilePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`\n✅ Backup created successfully!`);
    console.log(`   File size: ${fileSizeMB} MB`);
    console.log(`   Total records: ${totalRecords.toLocaleString()}`);
    console.log(`   Location: ${backupFilePath}`);
    
    // List backup files
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        stats: fs.statSync(path.join(backupDir, file))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime);
    
    console.log(`\n📋 Total backup files: ${backupFiles.length}`);
    if (backupFiles.length > 0) {
      console.log(`\n📁 Latest backups:`);
      backupFiles.slice(0, 5).forEach((file, index) => {
        const sizeMB = (file.stats.size / (1024 * 1024)).toFixed(2);
        const date = file.stats.mtime.toLocaleString();
        console.log(`   ${index + 1}. ${file.name} (${sizeMB} MB) - ${date}`);
      });
    }
    
    return backupFilePath;
    
  } catch (error) {
    console.error(`\n❌ Backup failed: ${error.message}`);
    throw error;
  }
}

// Get database statistics
async function getDatabaseStats() {
  console.log('\n📊 Database Review & Statistics');
  console.log('═'.repeat(60));
  
  try {
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
    
    const activeUsers = await prisma.user.count({ where: { status: 'active' } });
    const admins = await prisma.user.count({ where: { role: 'admin' } });
    const teachers = await prisma.user.count({ where: { role: 'teacher' } });
    
    console.log(`\n👥 User Status:`);
    console.log(`   Active:   ${activeUsers}`);
    console.log(`   Inactive: ${stats.users - activeUsers}`);
    console.log(`\n🎭 User Roles:`);
    console.log(`   Admins:   ${admins}`);
    console.log(`   Teachers: ${teachers}`);
    
    const activeEnrollments = await prisma.enrollment.count({ where: { drop: false } });
    const droppedEnrollments = stats.enrollments - activeEnrollments;
    console.log(`\n📚 Enrollment Status:`);
    console.log(`   Active:   ${activeEnrollments}`);
    console.log(`   Dropped:  ${droppedEnrollments}`);
    
    const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);
    console.log(`\n📦 Total Records: ${totalRecords.toLocaleString()}`);
    
    return stats;
  } catch (error) {
    console.warn(`⚠️  Could not fetch database statistics: ${error.message}`);
    return null;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Database Backup & Review Tool (Prisma)');
    console.log('═'.repeat(60));
    
    const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:password123@localhost:5432/postgres";
    console.log(`📊 Database: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`);
    
    // Step 1: Review database
    await getDatabaseStats();
    
    // Step 2: Create backup
    const backupFile = await createBackup();
    
    console.log('\n🎉 Backup completed successfully!');
    console.log('═'.repeat(60));
    console.log(`\n✅ Backup saved to: ${backupFile}`);
    console.log('\n📋 Next steps:');
    console.log('   1. Verify the backup file exists and has content');
    console.log('   2. Store backup in a secure location (cloud storage, external drive)');
    console.log('   3. Test restore if needed: node scripts/restore-database.js');
    
  } catch (error) {
    console.error('\n💥 Backup process failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createBackup, getDatabaseStats };

