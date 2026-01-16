$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Deployment Script for Notes App Backend" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host ""
Write-Host "ℹ️  I will run the commands for you, but you MUST enter the password when prompted."
Write-Host "🔑 Password: $PASSWORD_REMINDER" -ForegroundColor Yellow
Write-Host ""

# 1. Transfer Files
Write-Host "Step 1: Copying backend files to server..." -ForegroundColor Green
Write-Host "(Please enter the password if asked)" -ForegroundColor Gray
# Inspecting local directory to ensure we are in the right place
if (!(Test-Path "backend")) {
    Write-Error "Could not find 'backend' folder. Please run this from the 'notes-app' root directory."
}
# SCP command
scp -r backend ${USERNAME}@${SERVER_IP}:~/notes-app-backend

# 2. Remote Setup
Write-Host ""
Write-Host "Step 2: Connecting to server to run setup..." -ForegroundColor Green
Write-Host "(Please enter the password again if asked)" -ForegroundColor Gray

# SSH command to run the setup script remotely
# We chain commands: make script executable -> run it -> start pm2
$REMOTE_COMMANDS = "cd ~/notes-app-backend && chmod +x scripts/remote_setup.sh && ./scripts/remote_setup.sh && pm2 start server.js --name 'notes-backend' --force"

ssh -t ${USERNAME}@${SERVER_IP} $REMOTE_COMMANDS

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Process Finished!" -ForegroundColor Cyan
Write-Host "Test your API at: http://${SERVER_IP}:3001/api/test" -ForegroundColor Yellow
Write-Host "=========================================="
