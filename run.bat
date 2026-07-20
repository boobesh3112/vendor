@echo off
echo ===================================================
echo     PREMIUM VENDOR MANAGEMENT SYSTEM (STARTUP)
echo ===================================================
echo.
if "%1"=="prod" goto PROD

echo Installing root dependencies (dev)...
call npm install
echo.
echo Installing backend and frontend dependencies...
call npm run install-all
echo.
echo Starting client and server in development mode...
call npm run dev
goto END

:PROD
echo Installing root dependencies (production)...
call npm install
echo.
echo Installing backend and frontend dependencies...
call npm run install-all
echo.
echo Building frontend and starting backend (production)...
call npm run start:prod

:END
pause
