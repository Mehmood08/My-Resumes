$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Firewall Fixer" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host ""
Write-Host "I am going to connect to the server and open Port 3001."
Write-Host "When prompted, please type the password: $PASSWORD_REMINDER" -ForegroundColor Yellow
Write-Host ""

# Simple command string without special characters
$REMOTE_COMMANDS = "ufw allow 3001/tcp && ufw reload && echo 'Port 3001 Opened!'"

ssh -t ${USERNAME}@${SERVER_IP} $REMOTE_COMMANDS

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Done! Try your app again." -ForegroundColor Cyan
Write-Host "=========================================="
