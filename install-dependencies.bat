@echo off
echo Installing Greedoc Dependencies...
echo =================================

echo.
echo Installing backend dependencies...
cd server
npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ..\client
npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo =================================
echo Dependencies installed successfully!
echo.
echo Next steps:
echo 1. Configure Firebase service account
echo 2. Update environment variables
echo 3. Run: npm run dev (in both server and client folders)
echo =================================
pause
