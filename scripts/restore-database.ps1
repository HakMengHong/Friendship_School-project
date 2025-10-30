# Database Restore Script for Windows
# This script will clear your database and restore from backup

param(
    [string]$BackupFile = "",
    [string]$DatabaseUrl = "postgresql://postgres:password123@localhost:5432/postgres"
)

Write-Host "🚀 Starting database restore process..." -ForegroundColor Green

# Parse database URL
$urlPattern = "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)"
if ($DatabaseUrl -match $urlPattern) {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    Write-Error "❌ Invalid DATABASE_URL format: $DatabaseUrl"
    exit 1
}

Write-Host "📊 Database Configuration:" -ForegroundColor Cyan
Write-Host "   Host: $dbHost" -ForegroundColor White
Write-Host "   Port: $dbPort" -ForegroundColor White
Write-Host "   Database: $dbName" -ForegroundColor White
Write-Host "   User: $dbUser" -ForegroundColor White

# Set environment variable for password
$env:PGPASSWORD = $dbPassword

# Select backup file
if ($BackupFile -eq "") {
    Write-Host "📁 Looking for latest backup file..." -ForegroundColor Yellow
    
    $backupFiles = Get-ChildItem -Path "backup" -Filter "*.sql" | 
        Sort-Object LastWriteTime -Descending
    
    if ($backupFiles.Count -eq 0) {
        Write-Error "❌ No backup files found in backup directory"
        exit 1
    }
    
    $BackupFile = $backupFiles[0].FullName
    Write-Host "📁 Using latest backup: $($backupFiles[0].Name)" -ForegroundColor Green
} else {
    if (-not (Test-Path $BackupFile)) {
        Write-Error "❌ Backup file not found: $BackupFile"
        exit 1
    }
}

Write-Host "📥 Backup file: $BackupFile" -ForegroundColor Cyan

# Step 1: Clear existing data
Write-Host "🧹 Clearing existing database data..." -ForegroundColor Yellow

try {
    $clearCommand = @"
psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "
-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Clear all tables in correct order (respecting foreign key constraints)
TRUNCATE TABLE \"Grade\" CASCADE;
TRUNCATE TABLE \"Attendance\" CASCADE;
TRUNCATE TABLE \"Enrollment\" CASCADE;
TRUNCATE TABLE \"Course\" CASCADE;
TRUNCATE TABLE \"Student\" CASCADE;
TRUNCATE TABLE \"Subject\" CASCADE;
TRUNCATE TABLE \"Semester\" CASCADE;
TRUNCATE TABLE \"SchoolYear\" CASCADE;
TRUNCATE TABLE \"User\" CASCADE;

-- Reset sequences
ALTER SEQUENCE \"User_userId_seq\" RESTART WITH 1;
ALTER SEQUENCE \"Student_studentId_seq\" RESTART WITH 1;
ALTER SEQUENCE \"Course_courseId_seq\" RESTART WITH 1;
ALTER SEQUENCE \"Subject_subjectId_seq\" RESTART WITH 1;
ALTER SEQUENCE \"Semester_semesterId_seq\" RESTART WITH 1;
ALTER SEQUENCE \"SchoolYear_schoolYearId_seq\" RESTART WITH 1;
ALTER SEQUENCE \"Enrollment_enrollmentId_seq\" RESTART WITH 1;
ALTER SEQUENCE \"Grade_gradeId_seq\" RESTART WITH 1;
ALTER SEQUENCE \"Attendance_attendanceId_seq\" RESTART WITH 1;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;
"
"@

    Write-Host "🔄 Executing database clear..." -ForegroundColor Yellow
    Invoke-Expression $clearCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database cleared successfully" -ForegroundColor Green
    } else {
        Write-Error "❌ Failed to clear database"
        exit 1
    }
} catch {
    Write-Error "❌ Error clearing database: $($_.Exception.Message)"
    exit 1
}

# Step 2: Restore from backup
Write-Host "📥 Restoring database from backup..." -ForegroundColor Yellow

try {
    $restoreCommand = "psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f `"$BackupFile`""
    
    Write-Host "🔄 Executing database restore..." -ForegroundColor Yellow
    Invoke-Expression $restoreCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database restored successfully" -ForegroundColor Green
    } else {
        Write-Error "❌ Failed to restore database"
        exit 1
    }
} catch {
    Write-Error "❌ Error restoring database: $($_.Exception.Message)"
    exit 1
}

Write-Host "🎉 Database restore completed successfully!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test your application to ensure everything works" -ForegroundColor White
Write-Host "   2. Check that all data is properly restored" -ForegroundColor White
Write-Host "   3. Verify user authentication and permissions" -ForegroundColor White
