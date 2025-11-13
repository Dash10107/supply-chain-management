# Quick Deployment Guide - Vercel

## 🚀 Fastest Way to Deploy

### Step 1: Prepare Your Code

```bash
# Make sure everything is committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy Backend (API)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Project Name**: `walmart-scms-api`
   - **Root Directory**: `backend`
   - **Framework**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_rfZ5u9SscXLD@ep-old-bird-ado4pv6o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   JWT_SECRET=change-this-to-a-random-secret-key
   CORS_ORIGIN=*
   NODE_ENV=production
   ```
5. Click **Deploy**
6. **Copy the deployment URL** (e.g., `https://walmart-scms-api.vercel.app`)

### Step 3: Deploy Frontend

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the same repository
3. Configure:
   - **Project Name**: `walmart-scms`
   - **Root Directory**: `frontend`
   - **Framework**: Vite (auto-detected)
4. Add Environment Variable:
   ```
   VITE_API_URL=https://walmart-scms-api.vercel.app/api
   ```
   (Use your backend URL from Step 2)
5. Click **Deploy**

### Step 4: Update Backend CORS

1. Go to backend project settings
2. Update `CORS_ORIGIN` to your frontend URL
3. Redeploy backend

### Step 5: Seed Database

Run the seeder using Vercel CLI or create a temporary endpoint.

**Done!** 🎉

Your app should now be live at:
- Frontend: `https://walmart-scms.vercel.app`
- Backend: `https://walmart-scms-api.vercel.app`

---

## 🔧 Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Run `npm run build` locally first

**API not working?**
- Check environment variables
- Verify DATABASE_URL is correct
- Check function logs

**CORS errors?**
- Update CORS_ORIGIN in backend
- Redeploy backend

---

## 📝 Important URLs After Deployment

- Frontend: `https://your-frontend.vercel.app`
- Backend API: `https://your-backend.vercel.app/api`
- API Docs: `https://your-backend.vercel.app/api-docs`
- Health Check: `https://your-backend.vercel.app/health`

