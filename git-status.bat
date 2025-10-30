@echo off
REM Simple Git Status Script - See what's changed!

echo.
echo ========================================
echo   Git Status Check
echo ========================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ERROR: This is not a git repository!
    pause
    exit /b 1
)

echo Current branch:
git branch --show-current
echo.

echo Status:
git status
echo.

echo Recent commits:
git log --oneline -5
echo.

echo ========================================
echo   Press any key to close...
echo ========================================
pause >nul

