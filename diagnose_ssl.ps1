$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "=========================================="
Write-Host "SSL Diagnostic Tool (v2)"
Write-Host "=========================================="
Write-Host "Enter Password: $PASSWORD_REMINDER"

$REMOTE_SCRIPT = @'
echo "--- NGINX SITES ENABLED ---"
ls -l /etc/nginx/sites-enabled/
echo "--- NGINX DEFAULT CONFIG ---"
cat /etc/nginx/sites-available/default
echo "--- NGINX SYNTAX CHECK ---"
sudo nginx -t
echo "--- PORT 80 LISTENERS ---"
sudo netstat -tuln | grep :80
echo "--- CERTBOT LOGS ---"
sudo tail -n 50 /var/log/letsencrypt/letsencrypt.log
'@

$REMOTE_SCRIPT | Out-File -FilePath "temp_diag.sh" -Encoding ASCII

Write-Host "Uploading diagnostic script..."
scp temp_diag.sh ${USERNAME}@${SERVER_IP}:~/temp_diag.sh

Write-Host "Running diagnostics on server..."
ssh -t ${USERNAME}@${SERVER_IP} "sed -i 's/\r$//' ~/temp_diag.sh && bash ~/temp_diag.sh"

Remove-Item "temp_diag.sh"

Write-Host ""
Write-Host "=========================================="
