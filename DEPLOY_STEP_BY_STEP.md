# Step-by-Step Vercel Deployment Guide

## 📋 Prerequisites Checklist

- [ ] Code is pushed to GitHub
- [ ] Neon database is set up and accessible
- [ ] You have a Vercel account (sign up at vercel.com)
- [ ] GitHub account is connected to Vercel

---

## 🎯 Step 1: Prepare Your Repository

### 1.1 Commit All Changes
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.2 Verify Builds Work Locally
```bash
# Test backend build
cd backend
npm install
npm run build
# Should create dist/ folder

# Test frontend build
cd ../frontend
npm install
npm run build
# Should create dist/ folder
```

---

## 🚀 Step 2: Deploy Backend (API) to Vercel

### 2.1 Create New Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `walmart-scms` repository
5. Click **"Import"**

### 2.2 Configure Backend Project
Fill in the following:

- **Project Name**: `walmart-scms-api` (or your choice)
- **Root Directory**: Click "Edit" → Enter `backend`
- **Framework Preset**: Select **"Other"**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_rfZ5u9SscXLD@ep-old-bird-ado4pv6o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production` (use a strong random string) |
| `JWT_EXPIRES_IN` | `24h` |
| `CORS_ORIGIN` | `*` (we'll update this after frontend deployment) |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |

**Important**: 
- Click **"Add"** for each variable
- Select **"Production"**, **"Preview"**, and **"Development"** for each

### 2.4 Deploy
1. Click **"Deploy"** button
2. Wait for deployment (2-5 minutes)
3. **Copy the deployment URL** (e.g., `https://walmart-scms-api.vercel.app`)
4. Save this URL - you'll need it for frontend!

### 2.5 Verify Backend Deployment
1. Visit: `https://your-backend-url.vercel.app/health`
   - Should return: `{"status":"ok","timestamp":"..."}`
2. Visit: `https://your-backend-url.vercel.app/api-docs`
   - Should show Swagger documentation

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create New Project (Again)
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Select the **same repository** (`walmart-scms`)
3. Click **"Import"**

### 3.2 Configure Frontend Project
Fill in:

- **Project Name**: `walmart-scms` (or your choice)
- **Root Directory**: Click "Edit" → Enter `frontend`
- **Framework Preset**: **"Vite"** (should auto-detect)
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `dist` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

### 3.3 Add Environment Variable
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://walmart-scms-api.vercel.app/api` |

**Replace** `walmart-scms-api.vercel.app` with your actual backend URL from Step 2.4!

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait for deployment (1-3 minutes)
3. **Copy the frontend URL** (e.g., `https://walmart-scms.vercel.app`)

### 3.5 Verify Frontend Deployment
1. Visit your frontend URL
2. Should see the login page
3. Try logging in (will fail until database is seeded)

---

## 🔄 Step 4: Update Backend CORS

### 4.1 Update CORS_ORIGIN
1. Go to backend project in Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Find `CORS_ORIGIN`
4. Click **Edit**
5. Change value to your frontend URL: `https://walmart-scms.vercel.app`
6. Click **Save**

### 4.2 Redeploy Backend
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for redeployment

---

## 🌱 Step 5: Seed the Database

You need to populate the database with initial data.

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link to your project**:
   ```bash
   cd backend
   vercel link
   # Select your backend project
   ```

4. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

5. **Run seeder**:
   ```bash
   npm run seed
   ```

### Option B: Create Temporary Seed Endpoint

1. Add this to `backend/src/routes/index.ts` (temporarily):
   ```typescript
   import seedRoutes from './seed.routes';
   router.use('/seed', seedRoutes);
   ```

2. Create `backend/src/routes/seed.routes.ts`:
   ```typescript
   import { Router } from 'express';
   import { exec } from 'child_process';
   
   const router = Router();
   
   router.post('/', async (req, res) => {
     // Only allow in development or with secret key
     if (req.headers['x-seed-secret'] !== process.env.SEED_SECRET) {
       return res.status(401).json({ message: 'Unauthorized' });
     }
     
     exec('npm run seed', (error, stdout, stderr) => {
       if (error) {
         return res.status(500).json({ error: stderr });
       }
       res.json({ message: 'Database seeded successfully', output: stdout });
     });
   });
   
   export default router;
   ```

3. Add `SEED_SECRET` to environment variables
4. Call: `POST https://your-api.vercel.app/api/seed` with header `x-seed-secret`
5. **Remove this endpoint after seeding!**

### Option C: Use Neon SQL Editor

1. Go to Neon dashboard
2. Open SQL Editor
3. Manually insert data (not recommended, use seeder)

---

## ✅ Step 6: Test Everything

### 6.1 Test Backend
- [ ] Health check: `https://your-api.vercel.app/health`
- [ ] API docs: `https://your-api.vercel.app/api-docs`
- [ ] Login endpoint: `POST https://your-api.vercel.app/api/auth/login`

### 6.2 Test Frontend
- [ ] Visit frontend URL
- [ ] Login page loads
- [ ] Can login with: `admin@walmart-scms.com` / `password123`
- [ ] Dashboard loads
- [ ] Can navigate to different pages

### 6.3 Test Integration
- [ ] Frontend can call backend API
- [ ] No CORS errors in browser console
- [ ] Data loads correctly
- [ ] Forms submit successfully

---

## 🔧 Step 7: Fix Common Issues

### Issue: Build Fails
**Solution**:
1. Check build logs in Vercel
2. Run `npm run build` locally to see errors
3. Fix TypeScript/compilation errors
4. Ensure all dependencies are in `package.json`

### Issue: API Returns 404
**Solution**:
1. Check that routes are correct
2. Verify `api/index.ts` exists
3. Check Vercel function logs

### Issue: Database Connection Fails
**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check Neon database is accessible
3. Ensure SSL is enabled in connection string
4. Check Vercel function logs for errors

### Issue: CORS Errors
**Solution**:
1. Update `CORS_ORIGIN` in backend environment variables
2. Redeploy backend
3. Clear browser cache

### Issue: Frontend Can't Connect to API
**Solution**:
1. Verify `VITE_API_URL` is set correctly
2. Check it matches your backend URL
3. Ensure backend is deployed and accessible
4. Check browser console for errors

---

## 📝 Step 8: Final Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database seeded
- [ ] Can login successfully
- [ ] All pages load correctly
- [ ] API endpoints work
- [ ] No console errors
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Removed temporary seed endpoint (if created)

---

## 🎉 Success!

Your app is now live! 

- **Frontend**: `https://your-frontend.vercel.app`
- **Backend**: `https://your-backend.vercel.app`
- **API Docs**: `https://your-backend.vercel.app/api-docs`

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon Database Docs](https://neon.tech/docs)

---

## 🆘 Need Help?

1. Check Vercel deployment logs
2. Check browser console for errors
3. Check Vercel function logs
4. Verify all environment variables
5. Test locally first

Good luck! 🚀

