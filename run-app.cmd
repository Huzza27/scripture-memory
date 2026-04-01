@echo off
echo Starting Scripture Memory App...
echo.

REM Start backend server in new window
echo Starting backend server...
start "Scripture Memory - Backend" cmd /k "cd /d D:\Scripture Memory\backend && node src/index.js"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start mobile app in new window
echo Starting mobile app...
start "Scripture Memory - Mobile" cmd /k "cd /d D:\Scripture Memory\mobile && npx expo start --port 8082"

echo.
echo Both backend and mobile app are starting in separate windows.
echo Close those windows to stop the servers.
echo.
pause
