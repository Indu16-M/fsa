@echo off
echo ===================================================
echo     ShareByte - Starting Full Stack Application    
echo ===================================================

echo [1/2] Starting Flask Backend Server (Port 5000)...
start "ShareByte Backend" cmd /k "cd backend && py -3 app.py"

echo [2/2] Starting Vite Frontend Server (Port 5173)...
start "ShareByte Frontend" cmd /k "cd frontend && npm run dev -- --host"

echo.
echo Both servers are starting in new windows!
echo Backend API: http://localhost:5000
echo Frontend UI: http://localhost:5173
echo.
pause
