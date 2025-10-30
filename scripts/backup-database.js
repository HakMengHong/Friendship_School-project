#!/usr/bin/env node

/**
 * Database Backup Script
 * 
 * This script will:
 * 1. Review database structure and statistics
 * 2. Create a full PostgreSQL backup
 * 3. Store it in the backup/ directory with timestamp
 * 
 * Usage: node scripts/backup-database.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password123@localhost:5432/postgres";

// Parse database URL to extract connection details
function parseDatabaseUrl(url) {
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5]
  };
}

// Get database statistics using Prisma
async function getDatabaseStats() {
  console.log('\n📊 Database Review & Statistics');
  console.log('═'.repeat(60));
  
  try {
    // Dynamically import Prisma Client
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
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
    console.log(`   Users:            ${stats.users.toLocaleString()}`);
    console.log(`   Students:         ${stats.students.toLocaleString()}`);
    console.log(`   Courses:          ${stats.courses.toLocaleString()}`);
    console.log(`   Subjects:         ${stats.subjects.toLocaleString()}`);
    console.log(`   Grades:           ${stats.grades.toLocaleString()}`);
    console.log(`   Attendances:      ${stats.attendances.toLocaleString()}`);
    console.log(`   Enrollments:      ${stats.enrollments.toLocaleString()}`);
    console.log(`   School Years:     ${stats.schoolYears.toLocaleString()}`);
    console.log(`   Semesters:        ${stats.semesters.toLocaleString()}`);
    console.log(`   Activity Logs:    ${stats.activityLogs.toLocaleString()}`);
    console.log(`   Guardians:        ${stats.guardians.toLocaleString()}`);
    console.log(`   Family Info:      ${stats.familyInfo.toLocaleString()}`);
    console.log(`   Scholarships:     ${stats.scholarships.toLocaleString()}`);
    
    // Get active vs inactive users
    const activeUsers = await prisma.user.count({ where: { status: 'active' } });
    const inactiveUsers = stats.users - activeUsers;
    console.log(`\n👥 User Status:`);
    console.log(`   Active:   ${activeUsers}`);
    console.log(`   Inactive: ${inactiveUsers}`);
    
    // Get user roles
    const admins = await prisma.user.count({ where: { role: 'admin' } });
    const teachers = await prisma.user.count({ where: { role: 'teacher' } });
    console.log(`\n🎭 User Roles:`);
    console.log(`   Admins:   ${admins}`);
    console.log(`   Teachers: ${teachers}`);
    
    // Get enrollment stats
    const activeEnrollments = await prisma.enrollment.count({ where: { drop: false } });
    const droppedEnrollments = stats.enrollments - activeEnrollments;
    console.log(`\n📚 Enrollment Status:`);
    console.log(`   Active:   ${activeEnrollments}`);
    console.log(`   Dropped:  ${droppedEnrollments}`);
    
    // Get recent activity
    const recentLogs = await prisma.activityLog.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { username: true, firstname: true, lastname: true } } }
    });
    
    if (recentLogs.length > 0) {
      console.log(`\n🕐 Recent Activity (Last 5):`);
      recentLogs.forEach(log => {
        const user = log.user ? `${log.user.firstname} ${log.user.lastname}` : 'Unknown';
        const date = new Date(log.timestamp).toLocaleString();
        console.log(`   ${date} - ${user}: ${log.action}`);
      });
    }
    
    // Calculate total size estimate (rough)
    const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);
    console.log(`\n📦 Total Records: ${totalRecords.toLocaleString()}`);
    
    await prisma.$disconnect();
    
    return stats;
  } catch (error) {
    console.warn(`⚠️  Could not fetch database statistics: ${error.message}`);
    console.log('   Continuing with backup anyway...\n');
    return null;
  }
}

// Create database backup
async function backupDatabase() {
  console.log('\n💾 Starting Database Backup');
  console.log('═'.repeat(60));
  
  try {
    const dbConfig = parseDatabaseUrl(DATABASE_URL);
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${backupDir}`);
    }
    
    // Generate timestamp for backup filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const backupFileName = `friendship_school_backup_${dateStr}.sql`;
    const backupFilePath = path.join(backupDir, backupFileName);
    
    console.log(`📝 Backup file: ${backupFileName}`);
    console.log(`📂 Full path: ${backupFilePath}`);
    
    // Set PGPASSWORD environment variable for pg_dump
    process.env.PGPASSWORD = dbConfig.password;
    
    // Build pg_dump command
    // Options:
    // --verbose: Show progress
    // --no-owner: Don't include ownership commands
    // --no-acl: Don't include access privileges
    // --clean: Include DROP statements
    // --if-exists: Use IF EXISTS in DROP statements
    // --format=plain: Plain text SQL format
    const pgDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} --verbose --no-owner --no-acl --clean --if-exists --format=plain -f "${backupFilePath}"`;
    
    console.log(`🔄 Running pg_dump...`);
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    
    const { stdout, stderr } = await execAsync(pgDumpCommand);
    
    if (stderr && !stderr.includes('pg_dump: warning')) {
      console.warn(`⚠️  Warnings: ${stderr}`);
    }
    
    // Verify backup file was created
    if (fs.existsSync(backupFilePath)) {
      const stats = fs.statSync(backupFilePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`\n✅ Backup created successfully!`);
      console.log(`   File size: ${fileSizeMB} MB`);
      console.log(`   Location: ${backupFilePath}`);
      
      // List all backup files
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
    } else {
      throw new Error('Backup file was not created');
    }
    
  } catch (error) {
    console.error(`\n❌ Backup failed: ${error.message}`);
    
    // Check if pg_dump is installed
    if (error.message.includes('pg_dump') || error.message.includes('not found')) {
      console.error(`\n💡 Tip: Make sure PostgreSQL client tools (pg_dump) are installed.`);
      console.error(`   Windows: Install PostgreSQL from https://www.postgresql.org/download/windows/`);
      console.error(`   Mac: brew install postgresql`);
      console.error(`   Linux: sudo apt-get install postgresql-client`);
    }
    
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Database Backup & Review Tool');
    console.log('═'.repeat(60));
    console.log(`📊 Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
    
    // Step 1: Review database
    await getDatabaseStats();
    
    // Step 2: Create backup
    const backupFile = await backupDatabase();
    
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
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { backupDatabase, getDatabaseStats };

