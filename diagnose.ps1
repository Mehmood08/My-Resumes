$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Server Diagnostics" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "Enter Password: $PASSWORD_REMINDER" -ForegroundColor Yellow

# Commands to check environment
# 1. Check PATH
# 2. Check Node/PM2 location
# 3. Check running node processes
# 4. Check listening ports (using ss)
$REMOTE_COMMANDS = "echo '--- PATH ---'; echo \$PATH; echo '--- LOCATIONS ---'; which node; which pm2; echo '--- PROCESSES ---'; ps aux | grep node; echo '--- PORTS ---'; ss -tuln | grep 3001"

ssh -t ${USERNAME}@${SERVER_IP} $REMOTE_COMMANDS

Write-Host ""
Write-Host "=========================================="
