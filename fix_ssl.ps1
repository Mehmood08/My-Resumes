$ErrorActionPreference = "Stop"

$SERVER_IP = "139.59.74.75"
$USERNAME = "root"
$DOMAIN = "my-resume-2026.duckdns.org"
$PASSWORD_REMINDER = "?d+8C+6XSJE5Byx"

Write-Host "=========================================="
Write-Host "SSL Fix Tool (Updated Domain: $DOMAIN)"
Write-Host "=========================================="
Write-Host "Enter Password: $PASSWORD_REMINDER"

$REMOTE_SCRIPT = @"
echo "--> 1. Stopping Nginx..."
sudo systemctl stop nginx

echo "--> 2. Obtaining SSL Certificate for $DOMAIN..."
sudo certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos -m "admin@$DOMAIN" --expand

echo "--> 3. Configuring Nginx for HTTPS..."
cat <<'EOF' | sudo tee /etc/nginx/sites-available/default
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://`$host`$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_cache_bypass `$http_upgrade;
    }
}
EOF

echo "--> 4. Restarting Nginx..."
sudo systemctl start nginx
sudo systemctl status nginx --no-pager
"@

$REMOTE_SCRIPT | Out-File -FilePath "fix_ssl.sh" -Encoding ASCII

Write-Host "Uploading fix script..."
scp fix_ssl.sh ${USERNAME}@${SERVER_IP}:~/fix_ssl.sh

Write-Host "Running fix script on server..."
ssh -t ${USERNAME}@${SERVER_IP} "sed -i 's/\r`$//' ~/fix_ssl.sh && bash ~/fix_ssl.sh"

Remove-Item "fix_ssl.sh"

Write-Host ""
Write-Host "=========================================="
Write-Host "If you see 'Congratulations' above, your site is now SECURE!"
Write-Host "URL: https://$DOMAIN"
Write-Host "=========================================="
