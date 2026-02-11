@echo off
echo 🚀 Starting CodeCom Server...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found
    echo Please make sure .env file exists with Gmail configuration
    pause
    exit /b 1
)

echo 🎯 Starting server on port 3000...
echo 📧 Gmail integration enabled
echo 🌐 Access your website at: http://localhost:3000
echo ⏹️  Press Ctrl+C to stop the server
echo.

node server.js