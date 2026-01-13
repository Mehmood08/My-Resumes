# 🚀 Vercel Deployment Guide for Frontend

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Backend Deployed**: Your backend server should be deployed somewhere (Heroku, Railway, Render, etc.)
3. **GitHub Repository**: Your code should be in a GitHub repo (recommended)

## 🔧 Step 1: Fix Configuration Files

### ✅ Already Done:
- ✅ `vercel.json` created
- ✅ `vite.config.js` proxy fixed

### ⚠️ You Need to Update:
**Edit `vercel.json`** - Replace `your-backend-url.herokuapp.com` with your actual backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR-ACTUAL-BACKEND-URL.com/api/$1"
    }
  ]
}
```

## 🌐 Step 2: Deploy Backend First

Your backend needs to be deployed somewhere. Options:

### Option A: Railway (Recommended - Free tier available)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Set environment variables:
   - `MONGODB_URI`
   - `GOOGLE_CLIENT_ID`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `PORT` (Railway sets this automatically)
6. Railway will give you a URL like: `https://your-app.railway.app`

### Option B: Render (Free tier available)
1. Go to [render.com](https://render.com)
2. Sign up
3. Create "New Web Service"
4. Connect GitHub repo
5. Settings:
   - Build Command: (leave empty)
   - Start Command: `node server.js`
6. Add environment variables
7. Deploy

### Option C: Heroku
1. Install Heroku CLI
2. `heroku create your-app-name`
3. `git push heroku main`
4. Set environment variables in Heroku dashboard

## 📝 Step 3: Update Environment Variables

After deploying backend, update `vercel.json` with your backend URL.

## 🚀 Step 4: Deploy Frontend to Vercel

### Method 1: Via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. Click **"Add New Project"**
3. **Import your GitHub repository**:
   - Select your `notes-app` repository
   - Click "Import"
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)
5. **Environment Variables** (if needed):
   - Add any frontend env variables here
   - Your backend URL is in `vercel.json`, so no need here
6. Click **"Deploy"**
7. Wait for deployment (2-3 minutes)
8. ✅ **Your app will be live!** You'll get a URL like: `https://your-app.vercel.app`

### Method 2: Via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
4. **Follow prompts**:
   - Link to existing project? No (first time)
   - Project name: `notes-app` (or your choice)
   - Directory: `./`
   - Override settings? No

5. **For production**:
   ```bash
   vercel --prod
   ```

## 🔐 Step 5: Update Google OAuth Settings

After deployment, update Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```
6. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app
   ```
7. Save and wait 1-2 minutes

## ✅ Step 6: Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test features:
   - ✅ Page loads
   - ✅ Google Login works
   - ✅ Email/Password login works
   - ✅ Resume creation works
   - ✅ API calls work

## 🔄 Step 7: Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Main branch** → Production deployment
- **Other branches** → Preview deployments

## 🐛 Troubleshooting

### Issue: API calls failing (404)
**Solution**: Check `vercel.json` has correct backend URL

### Issue: CORS errors
**Solution**: Make sure backend has CORS enabled for your Vercel domain

### Issue: Google Login not working
**Solution**: Add Vercel URL to Google OAuth authorized origins

### Issue: Build fails
**Solution**: Check build logs in Vercel dashboard for errors

## 📝 Important Notes

1. **Backend URL**: Make sure your backend is deployed and accessible
2. **Environment Variables**: Backend needs all env vars set
3. **Database**: MongoDB should be accessible from your backend host
4. **HTTPS**: Vercel provides HTTPS automatically
5. **Custom Domain**: You can add custom domain in Vercel settings

## 🎉 You're Done!

Your frontend is now live on Vercel! 🚀

**Next Steps**:
- Share your Vercel URL
- Test all features
- Set up custom domain (optional)
- Monitor deployments in Vercel dashboard
