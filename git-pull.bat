@echo off
REM Simple Git Pull Script - Just double-click to pull from GitHub!

echo.
echo ========================================
echo   Pull from GitHub - Simple Script
echo ========================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ERROR: This is not a git repository!
    pause
    exit /b 1
)

echo Pulling latest changes from GitHub...
echo.

git pull

echo.
echo ========================================
echo   Done! Your local files are now updated.
echo ========================================
echo.
pause

