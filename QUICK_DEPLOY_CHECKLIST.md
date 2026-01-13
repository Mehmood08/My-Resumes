# ✅ Quick Vercel Deployment Checklist

## 🎯 Before You Start

- [ ] Backend deployed somewhere (Railway/Render/Heroku)
- [ ] Backend URL ready (e.g., `https://your-app.railway.app`)
- [ ] GitHub repository with your code
- [ ] Vercel account created

## 📝 Step-by-Step Deployment

### 1️⃣ Update Backend URL in `vercel.json`

**Edit `vercel.json`** and replace `YOUR-BACKEND-URL.com`:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-actual-backend.railway.app/api/$1"
    }
  ]
}
```

### 2️⃣ Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 3️⃣ Deploy on Vercel

**Option A: Via Website (Easiest)**
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Click **"Deploy"** (settings are auto-detected)
5. Wait 2-3 minutes
6. ✅ Done! Get your URL

**Option B: Via CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 4️⃣ Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Edit OAuth Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```
5. Save

### 5️⃣ Test Your App

Visit your Vercel URL and test:
- [ ] Page loads
- [ ] Google Login works
- [ ] Email/Password login works
- [ ] Resume creation works

## 🎉 Done!

Your frontend is live on Vercel!

**Need help?** Check `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions.
