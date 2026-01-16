$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Log Checker" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "Enter Password: $PASSWORD_REMINDER" -ForegroundColor Yellow

# Script to verify if the app is actually running or crashing
$REMOTE_COMMANDS = "echo '--- PM2 STATUS ---'; pm2 status; echo '--- LAST 20 LOG LINES ---'; pm2 logs notes-backend --lines 20 --nostream; echo '--- NETSTAT ---'; netstat -tuln | grep 3001; echo '--- UFW STATUS ---'; ufw status"

ssh -t ${USERNAME}@${SERVER_IP} $REMOTE_COMMANDS

Write-Host ""
Write-Host "=========================================="
