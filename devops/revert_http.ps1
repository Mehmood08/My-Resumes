$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "=========================================="
Write-Host "Emergency Revert (v2 - Literal Mode)"
Write-Host "=========================================="
Write-Host "Enter Password: $PASSWORD_REMINDER"

# Using @' (single quotes) creates a literal string where PowerShell won't touch the $ variables
$REMOTE_SCRIPT = @'
echo "--> 1. Reverting Nginx to basic HTTP (Safe Mode)..."
cat <<'EOF' | sudo tee /etc/nginx/sites-available/default
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo "--> 2. Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager
'@

$REMOTE_SCRIPT | Out-File -FilePath "revert_http.sh" -Encoding ASCII

Write-Host "Uploading revert script..."
scp revert_http.sh ${USERNAME}@${SERVER_IP}:~/revert_http.sh

Write-Host "Running revert script on server..."
ssh -t ${USERNAME}@${SERVER_IP} "sed -i 's/\r$//' ~/revert_http.sh && bash ~/revert_http.sh"

Remove-Item "revert_http.sh"

Write-Host ""
Write-Host "=========================================="
Write-Host "HTTP Access Restored!"
Write-Host "Your server should now be back online at: http://139.59.74.75"
Write-Host "=========================================="
