$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🛠️  Server Repair Tool (v2)" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "Enter Password: $PASSWORD_REMINDER" -ForegroundColor Yellow

# Script content
$REMOTE_SCRIPT = @'
echo "--> 1. Installing Utils..."
sudo apt-get update
sudo apt-get install -y net-tools curl

echo "--> 2. Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "--> 3. Installing PM2..."
sudo npm install -g pm2

echo "--> 4. Installing Dependencies..."
cd ~/notes-app-backend
npm install

echo "--> 5. Restarting App..."
pm2 delete all 2>/dev/null
pm2 start server.js --name "notes-backend" --force
pm2 save

echo "--> 6. Checking Status..."
pm2 status
netstat -tuln | grep 3001
'@

# Save locally
$REMOTE_SCRIPT | Out-File -FilePath "temp_repair.sh" -Encoding ASCII

# Upload
Write-Host "Uploading repair script..."
scp temp_repair.sh ${USERNAME}@${SERVER_IP}:~/temp_repair.sh

# Run with Line Ending Fix (sed)
Write-Host "Running repair script on server..."
# We use sed to remove \r (Windows carriage returns) before running
ssh -t ${USERNAME}@${SERVER_IP} "sed -i 's/\r$//' ~/temp_repair.sh && bash ~/temp_repair.sh"

# Cleanup
Remove-Item "temp_repair.sh"

Write-Host ""
Write-Host "=========================================="
Write-Host "Repairs Complete. Try accessing your site now." -ForegroundColor Green
Write-Host "=========================================="
