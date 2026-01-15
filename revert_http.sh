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
