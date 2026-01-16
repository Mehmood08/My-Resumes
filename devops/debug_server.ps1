$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Server Debugger" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "Please enter password: $PASSWORD_REMINDER" -ForegroundColor Yellow

# Commands to allow port 3001 and restart server
# Using semicolon chaining
$REMOTE_COMMANDS = "ufw allow 3001/tcp; ufw reload; pm2 restart notes-backend; echo '--- PORT STATUS ---'; netstat -tuln | grep 3001"

ssh -t ${USERNAME}@${SERVER_IP} $REMOTE_COMMANDS

Write-Host ""
Write-Host "=========================================="
