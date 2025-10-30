@echo off
REM Simple Git Push Script - Just double-click to push to GitHub!

echo.
echo ========================================
echo   Push to GitHub - Simple Script
echo ========================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ERROR: This is not a git repository!
    pause
    exit /b 1
)

echo [1/3] Checking for changes...
git status --short

echo.
echo [2/3] Adding all changes...
git add -A

echo.
echo [3/3] Committing and pushing...
echo.
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update project files

git commit -m "%commit_msg%"
if errorlevel 1 (
    echo No changes to commit.
    git push
) else (
    git push
)

echo.
echo ========================================
echo   Done! Check GitHub to see your changes.
echo ========================================
echo.
pause

