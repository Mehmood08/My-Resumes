$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Server Reload (Force Update)" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "Enter Password: $PASSWORD_REMINDER" -ForegroundColor Yellow

# Use --update-env to force PM2 to read the new .env file
$REMOTE_COMMANDS = "cd ~/notes-app-backend; pm2 restart notes-backend --update-env; echo '--- WAIT 5s ---'; sleep 5; echo '--- PORT CHECK ---'; netstat -tuln | grep 3001"

ssh -t ${USERNAME}@${SERVER_IP} $REMOTE_COMMANDS

Write-Host ""
Write-Host "=========================================="
