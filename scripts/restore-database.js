#!/usr/bin/env node

/**
 * Database Restore Script
 * 
 * This script will:
 * 1. Clear all existing data from the database
 * 2. Restore data from the backup SQL file
 * 
 * Usage: node scripts/restore-database.js [backup-file]
 * Example: node scripts/restore-database.js backup/friendship_school_backup_20251023_154032.sql
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Execute command and return promise
function execCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Executing: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`⚠️ Warning: ${stderr}`);
      }
      if (stdout) {
        console.log(`📝 Output: ${stdout}`);
      }
      resolve(stdout);
    });
  });
}

// Clear all data from database
async function clearDatabase() {
  console.log('🧹 Clearing existing database data...');
  
  try {
    const dbConfig = parseDatabaseUrl(DATABASE_URL);
    
    // Set PGPASSWORD environment variable
    process.env.PGPASSWORD = dbConfig.password;
    
    // Connect to database and clear all tables
    const clearCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -c "
      -- Disable foreign key checks temporarily
      SET session_replication_role = replica;
      
      -- Clear all tables in correct order (respecting foreign key constraints)
      TRUNCATE TABLE \\"Grade\\" CASCADE;
      TRUNCATE TABLE \\"Attendance\\" CASCADE;
      TRUNCATE TABLE \\"Enrollment\\" CASCADE;
      TRUNCATE TABLE \\"Course\\" CASCADE;
      TRUNCATE TABLE \\"Student\\" CASCADE;
      TRUNCATE TABLE \\"Subject\\" CASCADE;
      TRUNCATE TABLE \\"Semester\\" CASCADE;
      TRUNCATE TABLE \\"SchoolYear\\" CASCADE;
      TRUNCATE TABLE \\"User\\" CASCADE;
      
      -- Reset sequences
      ALTER SEQUENCE \\"User_userId_seq\\" RESTART WITH 1;
      ALTER SEQUENCE \\"Student_studentId_seq\\" RESTART WITH 1;
      ALTER SEQUENCE \\"Course_courseId_seq\\" RESTART WITH 1;
      ALTER SEQUENCE \\"Subject_subjectId_seq\\" RESTART WITH 1;
      ALTER SEQUENCE \\"Semester_semesterId_seq\\" RESTART WITH 1;
      ALTER SEQUENCE \\"SchoolYear_schoolYearId_seq\\" RESTART WITH 1;
      ALTER SEQUENCE \\"Enrollment_enrollmentId_seq\\" RESTART WITH 1;
      ALTER SEQUENCE \\"Grade_gradeId_seq\\" RESTART WITH 1;
      ALTER SEQUENCE \\"Attendance_attendanceId_seq\\" RESTART WITH 1;
      
      -- Re-enable foreign key checks
      SET session_replication_role = DEFAULT;
    "`;
    
    await execCommand(clearCommand);
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
    const dbConfig = parseDatabaseUrl(DATABASE_URL);
    
    // Set PGPASSWORD environment variable
    process.env.PGPASSWORD = dbConfig.password;
    
    // Restore from backup file
    const restoreCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f "${backupFile}"`;
    
    await execCommand(restoreCommand);
    console.log('✅ Database restored successfully');
    
  } catch (error) {
    console.error('❌ Failed to restore database:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting database restore process...');
    console.log(`📊 Database URL: ${DATABASE_URL}`);
    
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
    
    console.log('🎉 Database restore completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Test your application to ensure everything works');
    console.log('   2. Check that all data is properly restored');
    console.log('   3. Verify user authentication and permissions');
    
  } catch (error) {
    console.error('💥 Database restore failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { clearDatabase, restoreDatabase };
