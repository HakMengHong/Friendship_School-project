#!/usr/bin/env node

/**
 * Backup Verification Script
 * Compares current database with backup file to ensure all data was backed up
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyBackup(backupFile) {
  console.log('\n🔍 Verifying Backup File');
  console.log('═'.repeat(70));
  
  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found: ${backupFile}`);
    process.exit(1);
  }
  
  // Read backup file
  const backupContent = fs.readFileSync(backupFile, 'utf8');
  const backupStats = fs.statSync(backupFile);
  const fileSizeMB = (backupStats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`\n📄 Backup File: ${path.basename(backupFile)}`);
  console.log(`   Size: ${fileSizeMB} MB`);
  console.log(`   Lines: ${backupContent.split('\n').length.toLocaleString()}`);
  
  // Extract record counts from backup file
  const backupCounts = {};
  const tableRegex = /-- Table: (\w+) \((\d+) records\)/g;
  let match;
  while ((match = tableRegex.exec(backupContent)) !== null) {
    backupCounts[match[1]] = parseInt(match[2]);
  }
  
  // Get current database counts
  console.log('\n📊 Comparing Database vs Backup');
  console.log('─'.repeat(70));
  
  const dbCounts = {
    User: await prisma.user.count(),
    Student: await prisma.student.count(),
    Course: await prisma.course.count(),
    Subject: await prisma.subject.count(),
    Grade: await prisma.grade.count(),
    Attendance: await prisma.attendance.count(),
    Enrollment: await prisma.enrollment.count(),
    SchoolYear: await prisma.schoolYear.count(),
    Semester: await prisma.semester.count(),
    ActivityLog: await prisma.activityLog.count(),
    Guardian: await prisma.guardian.count(),
    FamilyInfo: await prisma.familyInfo.count(),
    Scholarship: await prisma.scholarship.count(),
  };
  
  console.log('\n   Table'.padEnd(20) + 'Database'.padStart(15) + 'Backup'.padStart(15) + 'Status'.padStart(15));
  console.log('─'.repeat(70));
  
  let allMatch = true;
  const totalDb = Object.values(dbCounts).reduce((a, b) => a + b, 0);
  const totalBackup = Object.values(backupCounts).reduce((a, b) => a + b, 0);
  
  for (const [table, dbCount] of Object.entries(dbCounts)) {
    const backupCount = backupCounts[table] || 0;
    const match = dbCount === backupCount;
    const status = match ? '✅ Match' : '❌ Mismatch';
    const dbStr = dbCount.toLocaleString().padStart(14);
    const backupStr = backupCount.toLocaleString().padStart(14);
    
    console.log(`   ${table.padEnd(19)}${dbStr}${backupStr}${status.padStart(15)}`);
    
    if (!match) {
      allMatch = false;
      console.log(`      ⚠️  Difference: ${Math.abs(dbCount - backupCount)} records`);
    }
  }
  
  console.log('─'.repeat(70));
  console.log(`   ${'TOTAL'.padEnd(19)}${totalDb.toLocaleString().padStart(14)}${totalBackup.toLocaleString().padStart(14)}${(totalDb === totalBackup ? '✅ Match' : '❌ Mismatch').padStart(15)}`);
  
  // Check for total records mentioned in backup
  const totalMatch = backupContent.match(/Total Records: ([\d,]+)/);
  if (totalMatch) {
    const backupTotal = parseInt(totalMatch[1].replace(/,/g, ''));
    console.log(`\n   Backup file mentions: ${backupTotal.toLocaleString()} total records`);
  }
  
  // Verify backup file structure
  console.log('\n📋 Backup File Structure Check:');
  console.log('─'.repeat(70));
  
  const hasStartComment = backupContent.includes('Friendship School Database Backup');
  const hasEndComment = backupContent.includes('Backup Completed');
  const hasTruncateStatements = (backupContent.match(/TRUNCATE TABLE/g) || []).length;
  const hasInsertStatements = (backupContent.match(/INSERT INTO/g) || []).length;
  
  console.log(`   ✅ Has header comment: ${hasStartComment ? 'Yes' : 'No'}`);
  console.log(`   ✅ Has footer comment: ${hasEndComment ? 'Yes' : 'No'}`);
  console.log(`   ✅ Has TRUNCATE statements: ${hasTruncateStatements}`);
  console.log(`   ✅ Has INSERT statements: ${hasInsertStatements}`);
  
  // Final verdict
  console.log('\n' + '═'.repeat(70));
  if (allMatch && totalDb === totalBackup) {
    console.log('✅ VERIFICATION PASSED: All data backed up successfully!');
    console.log(`   Total records in database: ${totalDb.toLocaleString()}`);
    console.log(`   Total records in backup: ${totalBackup.toLocaleString()}`);
  } else {
    console.log('⚠️  VERIFICATION WARNING: Some discrepancies found');
    console.log(`   Please review the differences above`);
  }
  console.log('═'.repeat(70));
  
  return allMatch && totalDb === totalBackup;
}

async function main() {
  try {
    // Get latest backup file
    const backupDir = path.join(process.cwd(), 'backup');
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        stats: fs.statSync(path.join(backupDir, file))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime);
    
    if (backupFiles.length === 0) {
      console.error('❌ No backup files found in backup directory');
      process.exit(1);
    }
    
    const latestBackup = backupFiles[0];
    const backupFile = process.argv[2] || latestBackup.path;
    
    console.log(`\n📁 Using backup: ${latestBackup.name}`);
    console.log(`   Created: ${latestBackup.stats.mtime.toLocaleString()}`);
    
    await verifyBackup(backupFile);
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { verifyBackup };

