$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Full Re-Deploy & Start" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "This script will upload your files AND start the server."
Write-Host "You might be asked for the password TWICE."
Write-Host "Password: $PASSWORD_REMINDER" -ForegroundColor Yellow

# 1. Upload Files
Write-Host ""
Write-Host "Step 1: Uploading 'backend' folder..." -ForegroundColor Green
if (Test-Path "backend") {
    # We rename it on dest to avoid nesting like notes-app-backend/backend
    scp -r backend ${USERNAME}@${SERVER_IP}:~/notes-app-backend
}
else {
    Write-Error "CRITICAL: 'backend' folder not found in current directory!"
}

# 2. Start Server
Write-Host ""
Write-Host "Step 2: Starting Server..." -ForegroundColor Green
$REMOTE_COMMANDS = "cd ~/notes-app-backend; npm install; pm2 delete all 2>/dev/null; pm2 start server.js --name 'notes-backend'; pm2 save; echo '--- STATUS ---'; pm2 status"

ssh -t ${USERNAME}@${SERVER_IP} $REMOTE_COMMANDS

Write-Host ""
Write-Host "=========================================="
Write-Host "Done! App should be running now." -ForegroundColor Green
Write-Host "=========================================="
