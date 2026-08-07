@echo off
title Filament Manager - 3D Printing Dashboard
color 0B

echo.
echo  ==========================================
echo    Filament Manager - 3D Printing Tracker
echo  ==========================================
echo.
echo  Starting local server and database, please wait...
echo.

REM Change to the directory where this batch file lives
cd /d "%~dp0"

REM Check if Node.js is available
where node >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo  Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists, install if not
if not exist "node_modules\" (
    echo  [INFO] Installing dependencies for the first time...
    echo  This may take a minute. Please wait.
    echo.
    call npm install
    if errorlevel 1 (
        echo  [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

REM Kill any previous instances to avoid conflicts
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3001 "') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Start the backend server (API & Database)
echo  [OK] Starting Backend Database...
start "Filament Backend" /MIN node server.js

REM Start the Vite frontend server
echo  [OK] Starting Frontend Interface...
start "Filament Frontend" /MIN npx vite --port 5173

REM Wait a moment for servers to start
timeout /t 3 /nobreak >nul

REM Open the browser automatically
start "" "http://localhost:5173"

echo.
echo  ==========================================
echo    Filament Manager is RUNNING
echo    Open: http://localhost:5173
echo  ==========================================
echo.
echo  Keep this window open while using the app.
echo  Press Ctrl+C or close this window to stop everything.
echo.

REM Wait for user to close window or press Ctrl+C, then kill both Node processes we spawned
:keepalive
timeout /t 30 /nobreak >nul
goto keepalive
