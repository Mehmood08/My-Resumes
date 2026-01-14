$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Server Starter" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "Enter Password: $PASSWORD_REMINDER" -ForegroundColor Yellow

# Script to start the app
$REMOTE_COMMANDS = "cd ~/notes-app-backend; npm install; pm2 start server.js --name 'notes-backend'; pm2 save; echo '--- NEW STATUS ---'; pm2 list; echo '--- PORT CHECK ---'; netstat -tuln | grep 3001"

ssh -t ${USERNAME}@${SERVER_IP} $REMOTE_COMMANDS

Write-Host ""
Write-Host "=========================================="
