#!/bin/bash

# friendly-setup.sh
echo "=========================================="
echo "🚀 Starting Automated Server Setup"
echo "=========================================="

# 1. Update system packages
echo "--> Updating system packages..."
sudo apt-get update -y

# 2. Install Node.js (Version 20 LTS)
echo "--> Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "    Node.js is already installed!"
fi

# 3. Install Git (just in case)
echo "--> Checking for Git..."
sudo apt-get install -y git

# 4. Install PM2 globally
echo "--> Installing PM2 (Process Manager)..."
sudo npm install -g pm2

# 5. Install Project Dependencies
echo "--> Installing backend dependencies..."
# Ensure we are in the directory containing package.json
if [ -f "package.json" ]; then
    npm install
else
    echo "⚠️  WARNING: package.json not found in current directory!"
    echo "    Please make sure you are in the 'notes-app-backend' folder."
    exit 1
fi

echo "=========================================="
echo "✅ Setup Complete!"
echo "You can now start your app using:"
echo "pm2 start server.js --name 'notes-backend'"
echo "=========================================="
