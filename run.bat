@echo off
echo ===================================================
echo     PREMIUM VENDOR MANAGEMENT SYSTEM (STARTUP)
echo ===================================================
echo.
echo Installing root dependencies...
call npm install
echo.
echo Installing backend and frontend dependencies...
call npm run install-all
echo.
echo Starting client and server in development mode...
call npm run dev
pause
