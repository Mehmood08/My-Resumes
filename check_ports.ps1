$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Port Examiner" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "Enter Password: $PASSWORD_REMINDER" -ForegroundColor Yellow

# Check specifically for port 3001 using different tools to be sure
# netstat -tuln shows the IP it is bound to clearly
$REMOTE_COMMANDS = "echo '--- NETSTAT (Looking for 3001) ---'; netstat -tuln | grep 3001"

ssh -t ${USERNAME}@${SERVER_IP} $REMOTE_COMMANDS

Write-Host ""
Write-Host "=========================================="
Write-Host "CHECK THE OUTPUT ABOVE:"
Write-Host "If you see '127.0.0.1:3001', that is the problem."
Write-Host "If you see '0.0.0.0:3001' or ':::3001', it is good."
Write-Host "=========================================="
