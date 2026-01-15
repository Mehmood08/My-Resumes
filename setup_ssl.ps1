$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$DOMAIN = "resume-generator.duckdns.org"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "=========================================="
Write-Host "SSL/HTTPS Auto-Setup (v2)"
Write-Host "=========================================="
Write-Host "Domain: $DOMAIN"
Write-Host "Enter Password: $PASSWORD_REMINDER"

# We create the Nginx config as a separate file to avoid complex shell escaping
$NGINX_CONF = @"
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_cache_bypass `$http_upgrade;
    }
}
"@

$NGINX_CONF | Out-File -FilePath "nginx_default" -Encoding ASCII

# Remote setup script
$REMOTE_SCRIPT = @'
echo "--> 1. Installing Nginx and Certbot..."
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "--> 2. Applying Nginx Config..."
sudo mv ~/nginx_default /etc/nginx/sites-available/default
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

echo "--> 3. Opening Firewall (80, 443)..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

echo "--> 4. Obtaining SSL Certificate..."
sudo certbot --nginx -d resume-generator.duckdns.org --non-interactive --agree-tos -m "admin@resume-generator.duckdns.org" --redirect

echo "--> 5. Restarting Nginx..."
sudo systemctl restart nginx
pm2 status
'@

$REMOTE_SCRIPT | Out-File -FilePath "temp_ssl.sh" -Encoding ASCII

# Upload files
Write-Host "Uploading configuration..."
scp nginx_default ${USERNAME}@${SERVER_IP}:~/nginx_default
scp temp_ssl.sh ${USERNAME}@${SERVER_IP}:~/temp_ssl.sh

# Run
Write-Host "Running setup on server (this may take 1-2 minutes)..."
ssh -t ${USERNAME}@${SERVER_IP} "sed -i 's/\r$//' ~/temp_ssl.sh && bash ~/temp_ssl.sh"

# Cleanup
Remove-Item "nginx_default"
Remove-Item "temp_ssl.sh"

Write-Host ""
Write-Host "=========================================="
Write-Host "HTTPS Setup Complete!"
Write-Host "Your backend is now secure at: https://$DOMAIN"
Write-Host "=========================================="
