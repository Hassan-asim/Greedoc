@echo off
echo Setting up Greedoc - AI Health Companion
echo ========================================

echo.
echo Installing Node.js dependencies...
echo.

echo Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo Creating environment files...
cd ..\server
if not exist .env (
    copy env.example .env
    echo Created server/.env file
)

cd ..\client
if not exist .env (
    copy env.example .env
    echo Created client/.env file
)

echo.
echo ========================================
echo Setup completed successfully!
echo.
echo Next steps:
echo 1. Configure Firebase project
echo 2. Update environment variables
echo 3. Run the application
echo.
echo For detailed instructions, see README.md
echo ========================================
pause
