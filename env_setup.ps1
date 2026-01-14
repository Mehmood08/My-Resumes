$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Configuring Environment (.env)" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "Enter Password: $PASSWORD_REMINDER" -ForegroundColor Yellow

# Create the .env content (Using Port 3001 to match firewall)
# We escape the dollar sign in the password just in case, though usually fine in single quotes
$ENV_CONTENT = @'
MONGODB_URI=mongodb+srv://Mehmood-Shah:Abcd1234@resumecluster.fhmadx3.mongodb.net/resumeDB?retryWrites=true&w=majority
PORT=3001
GOOGLE_CLIENT_ID=1042081648232-0jteg1ui82qc1k1ckid5i08lsmtb3oa6.apps.googleusercontent.com
JWT_SECRET=supersecretresumekey12345
GEMINI_API_KEY=AIzaSyCwo-DqjQjt9fB66nidoUIxYmpMKSvhSMI
'@

# Save to local temporary file
$ENV_CONTENT | Out-File -FilePath "temp_env.txt" -Encoding ASCII

# 1. Upload .env
Write-Host "Uploading .env file..."
scp temp_env.txt ${USERNAME}@${SERVER_IP}:~/notes-app-backend/.env

# 2. Restart Server
Write-Host "Restarting Server to apply changes..."
$REMOTE_COMMANDS = "cd ~/notes-app-backend; pm2 restart notes-backend; echo '--- STATUS ---'; pm2 status; echo '--- PORT CHECK ---'; netstat -tuln | grep 3001"

ssh -t ${USERNAME}@${SERVER_IP} $REMOTE_COMMANDS

# Cleanup
Remove-Item "temp_env.txt"

Write-Host ""
Write-Host "=========================================="
Write-Host "Done! The app should now stay online." -ForegroundColor Green
Write-Host "=========================================="
