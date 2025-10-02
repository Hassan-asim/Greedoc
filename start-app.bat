@echo off
echo Starting Greedoc Application...
echo ================================

echo.
echo Starting backend server...
start "Greedoc Backend" cmd /k "cd server && npm run dev"

echo.
echo Waiting 3 seconds before starting frontend...
timeout /t 3 /nobreak > nul

echo.
echo Starting frontend server...
start "Greedoc Frontend" cmd /k "cd client && npm run dev"

echo.
echo ================================
echo Both servers are starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window
echo ================================
pause
