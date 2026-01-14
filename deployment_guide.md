# 🚀 Deployment Guide: Getting Your Backend Online (Specific)

Great! Since we have the details, I've created a script to handle most of this for you.

## Quick Start (Recommended)

1.  Open your **PowerShell** or Terminal in `d:\projects\notes-app`.
2.  Run the new deployment script:
    ```powershell
    .\deploy.ps1
    ```
3.  When asked for the password, type: `?d+8C+6XSJE5Byx`
    *(Note: You won't see the password while typing. Just type it and press Enter).*

---

## Manual Steps (If the script fails)

If you prefer running commands manually, here they are with your details filled in.

**Server IP:** `139.59.74.75`
**User:** `root`
**Password:** `?d+8C+6XSJE5Byx`

### Step 1: Copy Files
```powershell
scp -r backend root@139.59.74.75:~/notes-app-backend
```

### Step 2: Connect & Setup
```powershell
ssh root@139.59.74.75
```
*Once logged in:*

```bash
cd ~/notes-app-backend
chmod +x scripts/remote_setup.sh
./scripts/remote_setup.sh
pm2 start server.js --name "notes-backend"
```

### Step 3: Verify
Check if your backend is running:
`http://139.59.74.75:3001`
