# 🚀 Deploy Frontend First - Step by Step

## ✅ Current Setup

I've updated `vercel.json` to deploy frontend **without backend URL** for now. You can add it later!

## 📝 Step 1: Deploy Frontend to Vercel

### Via Vercel Website (Easiest):

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. Click **"Add New Project"**
3. **Import your GitHub repository**:
   - Connect GitHub if not already connected
   - Select your `notes-app` repository
   - Click "Import"
4. **Configure Project** (auto-detected):
   - Framework Preset: **Vite** ✅
   - Root Directory: `./` ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `dist` ✅
5. Click **"Deploy"**
6. Wait 2-3 minutes for deployment
7. ✅ **Your frontend is live!** You'll get a URL like: `https://your-app.vercel.app`

### Via Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel --prod
```

## ⚠️ What Will Work / Won't Work

### ✅ Will Work:
- ✅ Frontend loads
- ✅ UI displays
- ✅ Static content

### ❌ Won't Work (Until Backend is Deployed):
- ❌ Login (Google or Email/Password)
- ❌ API calls (`/api/*` endpoints)
- ❌ Resume creation/saving
- ❌ Database operations

**This is normal!** The frontend will show errors for API calls until backend is deployed.

## 🔄 Step 2: Add Backend URL Later (After Backend Deployment)

Once you deploy your backend and get the backend URL, you have **2 options**:

### Option A: Update vercel.json (Recommended)

1. **Edit `vercel.json`** in your project:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://YOUR-BACKEND-URL.com/api/$1"
       }
     ]
   }
   ```
   Replace `YOUR-BACKEND-URL.com` with your actual backend URL.

2. **Push to GitHub**:
   ```bash
   git add vercel.json
   git commit -m "Add backend URL"
   git push
   ```

3. **Vercel will auto-redeploy** with the new backend URL!

### Option B: Use Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.com`
3. Update your code to use `import.meta.env.VITE_API_URL`
4. Redeploy

## 📋 After Backend is Deployed

1. **Get your backend URL** (e.g., `https://notes-backend.railway.app`)
2. **Tell me the URL** and I'll update `vercel.json` for you
3. **Or update it yourself** following Option A above
4. **Push to GitHub** - Vercel auto-redeploys
5. **Update Google OAuth** with your Vercel URL
6. ✅ Everything works!

## 🎯 Summary

- ✅ **Deploy frontend NOW** - It will work (just no API calls)
- ⏳ **Deploy backend LATER** - When ready
- 🔄 **Add backend URL** - Update `vercel.json` and push
- ✅ **Everything works!**

## 💡 Pro Tip

You can test the frontend UI now, and add backend functionality later. The frontend will be live and you can see how it looks!

---

**Ready to deploy?** Go to [vercel.com](https://vercel.com) and follow Step 1! 🚀
