@echo off
echo 🚀 Database Restore Script
echo =========================

REM Check if backup directory exists
if not exist "backup" (
    echo ❌ Backup directory not found!
    pause
    exit /b 1
)

REM List available backup files
echo 📁 Available backup files:
dir /b backup\*.sql
echo.

REM Run the PowerShell script
echo 🔄 Starting database restore...
powershell -ExecutionPolicy Bypass -File "scripts\restore-database.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database restore completed successfully!
    echo 📋 Please test your application to verify the restore.
) else (
    echo.
    echo ❌ Database restore failed!
    echo Please check the error messages above.
)

echo.
pause
