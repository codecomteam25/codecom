# CodeCom Server Startup Script
Write-Host "🚀 Starting CodeCom Server..." -ForegroundColor Cyan

# Check if Node.js is installed
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "Please make sure .env file exists with Gmail configuration" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Kill any existing processes on port 3000
Write-Host "🔍 Checking for existing server on port 3000..." -ForegroundColor Yellow
$existingProcess = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "🛑 Port 3000 is already in use. Attempting to free it..." -ForegroundColor Yellow
    $processId = (Get-NetTCPConnection -LocalPort 3000 -State Listen).OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Start the server
Write-Host "🎯 Starting server on port 3000..." -ForegroundColor Green
Write-Host "📧 Gmail integration enabled" -ForegroundColor Green
Write-Host "🌐 Access your website at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "⏹️  Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

node server.js