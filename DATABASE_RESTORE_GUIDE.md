# 🗄️ Database Restore Guide

## 📋 Overview

This guide will help you safely clear your current database and restore data from your backup files.

## ⚠️ Important Warnings

**⚠️ THIS WILL DELETE ALL CURRENT DATA IN YOUR DATABASE!**
- Make sure you have a current backup before proceeding
- This process cannot be undone
- All existing data will be permanently lost

## 📁 Available Backup Files

Your backup directory contains:
- `friendship_school_backup_20251023_153959.sql`
- `friendship_school_backup_20251023_154032.sql` (Latest)

## 🚀 Restore Methods

### Method 1: Easy Batch File (Recommended for Windows)

1. **Double-click** `restore-db.bat` in your project root
2. The script will automatically:
   - Show available backup files
   - Use the latest backup file
   - Clear your database
   - Restore from backup

### Method 2: PowerShell Script

```powershell
# Use latest backup (automatic selection)
.\scripts\restore-database.ps1

# Use specific backup file
.\scripts\restore-database.ps1 -BackupFile "backup\friendship_school_backup_20251023_154032.sql"

# Use custom database URL
.\scripts\restore-database.ps1 -DatabaseUrl "postgresql://user:pass@host:port/db"
```

### Method 3: Node.js Script

```bash
# Use latest backup (automatic selection)
node scripts/restore-database.js

# Use specific backup file
node scripts/restore-database.js backup/friendship_school_backup_20251023_154032.sql
```

## 🔧 Manual Restore (Advanced)

If the scripts don't work, you can restore manually:

### Step 1: Clear Database
```sql
-- Connect to your database and run:
SET session_replication_role = replica;

TRUNCATE TABLE "Grade" CASCADE;
TRUNCATE TABLE "Attendance" CASCADE;
TRUNCATE TABLE "Enrollment" CASCADE;
TRUNCATE TABLE "Course" CASCADE;
TRUNCATE TABLE "Student" CASCADE;
TRUNCATE TABLE "Subject" CASCADE;
TRUNCATE TABLE "Semester" CASCADE;
TRUNCATE TABLE "SchoolYear" CASCADE;
TRUNCATE TABLE "User" CASCADE;

-- Reset sequences
ALTER SEQUENCE "User_userId_seq" RESTART WITH 1;
ALTER SEQUENCE "Student_studentId_seq" RESTART WITH 1;
ALTER SEQUENCE "Course_courseId_seq" RESTART WITH 1;
ALTER SEQUENCE "Subject_subjectId_seq" RESTART WITH 1;
ALTER SEQUENCE "Semester_semesterId_seq" RESTART WITH 1;
ALTER SEQUENCE "SchoolYear_schoolYearId_seq" RESTART WITH 1;
ALTER SEQUENCE "Enrollment_enrollmentId_seq" RESTART WITH 1;
ALTER SEQUENCE "Grade_gradeId_seq" RESTART WITH 1;
ALTER SEQUENCE "Attendance_attendanceId_seq" RESTART WITH 1;

SET session_replication_role = DEFAULT;
```

### Step 2: Restore from Backup
```bash
# Using psql command
psql -h localhost -p 5432 -U postgres -d postgres -f "backup/friendship_school_backup_20251023_154032.sql"
```

## ✅ Verification Steps

After restore, verify your data:

1. **Check User Count:**
   ```sql
   SELECT COUNT(*) FROM "User";
   ```

2. **Check Student Count:**
   ```sql
   SELECT COUNT(*) FROM "Student";
   ```

3. **Check Course Count:**
   ```sql
   SELECT COUNT(*) FROM "Course";
   ```

4. **Test Application:**
   - Start your application
   - Try logging in
   - Check if data is visible
   - Test key functionalities

## 🛠️ Troubleshooting

### Common Issues:

1. **Permission Denied:**
   - Make sure PostgreSQL is running
   - Check database credentials
   - Verify user has necessary permissions

2. **Connection Failed:**
   - Check if PostgreSQL service is running
   - Verify database URL in environment variables
   - Ensure database exists

3. **Backup File Not Found:**
   - Check if backup files exist in `backup/` directory
   - Verify file permissions
   - Ensure files are not corrupted

### Error Solutions:

**"psql: command not found":**
- Install PostgreSQL client tools
- Add PostgreSQL bin directory to PATH

**"Authentication failed":**
- Check username and password
- Verify database exists
- Check PostgreSQL authentication settings

**"Database does not exist":**
- Create the database first:
  ```sql
  CREATE DATABASE postgres;
  ```

## 📞 Support

If you encounter issues:

1. Check the error messages carefully
2. Verify your database configuration
3. Ensure PostgreSQL is running
4. Check file permissions
5. Review the backup file integrity

## 🎯 Success Indicators

You'll know the restore was successful when:
- ✅ No error messages during restore
- ✅ Application starts without errors
- ✅ You can log in with existing credentials
- ✅ Data is visible in the application
- ✅ All functionalities work as expected

---

**Remember:** Always test your application after restore to ensure everything works correctly!
