# Vercel Deployment Guide - Step by Step

This guide will help you deploy both the frontend and backend to Vercel.

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Neon Database** - Already configured (you have the connection string)

---

## Option 1: Deploy Frontend and Backend Separately (Recommended)

### Step 1: Deploy Backend (API) First

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"

2. **Import Your Repository**
   - Connect your GitHub account if not already connected
   - Select your `walmart-scms` repository
   - Click "Import"

3. **Configure Backend Project**
   - **Project Name**: `walmart-scms-api` (or your preferred name)
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables** (Click "Environment Variables" and add):
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://neondb_owner:npg_rfZ5u9SscXLD@ep-old-bird-ado4pv6o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - **Copy the deployment URL** (e.g., `https://walmart-scms-api.vercel.app`)

### Step 2: Deploy Frontend

1. **Add New Project in Vercel**
   - Click "Add New Project" again
   - Select the same repository

2. **Configure Frontend Project**
   - **Project Name**: `walmart-scms` (or your preferred name)
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

3. **Environment Variables**:
   ```
   VITE_API_URL=https://walmart-scms-api.vercel.app/api
   ```
   (Use the backend URL from Step 1)

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment

5. **Update Backend CORS** (if needed)
   - Go back to backend project settings
   - Update `CORS_ORIGIN` to your frontend URL
   - Redeploy backend

---

## Option 2: Deploy as Monorepo (Single Project)

### Step 1: Prepare Repository

1. **Create vercel.json in root** (already created)
2. **Ensure both package.json files are correct**

### Step 2: Deploy to Vercel

1. **Import Repository**
   - Go to Vercel Dashboard
   - Click "Add New Project"
   - Select your repository

2. **Configure Project**
   - **Root Directory**: `.` (root)
   - **Framework Preset**: Other
   - **Build Command**: `cd frontend && npm run build && cd ../backend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install && cd ../backend && npm install`

3. **Environment Variables**:
   ```
   # Backend
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://neondb_owner:npg_rfZ5u9SscXLD@ep-old-bird-ado4pv6o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://your-project.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Frontend
   VITE_API_URL=/api
   ```

4. **Deploy**
   - Click "Deploy"

---

## Post-Deployment Steps

### 1. Seed the Database

After backend is deployed, you need to seed the database:

**Option A: Using Vercel CLI**
```bash
npm i -g vercel
vercel login
cd backend
vercel env pull .env.local
npm run seed
```

**Option B: Using Neon Console**
- Connect to your Neon database
- Run the seeder script manually or use SQL

**Option C: Create a Seed Endpoint** (Temporary)
Add a temporary endpoint in backend to seed:
```typescript
// Only for initial setup, remove after seeding
router.post('/seed', async (req, res) => {
  // Run seeder
  // Remove this endpoint after seeding!
});
```

### 2. Test the Deployment

1. **Frontend**: Visit your frontend URL
2. **Backend API**: Visit `https://your-api-url.vercel.app/api-docs` for Swagger docs
3. **Health Check**: Visit `https://your-api-url.vercel.app/health`

### 3. Update CORS if Needed

If you get CORS errors:
- Go to backend project settings
- Update `CORS_ORIGIN` environment variable
- Redeploy

---

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Ensure all dependencies are in package.json**
3. **Check TypeScript errors**: Run `npm run build` locally first

### API Not Working

1. **Check environment variables** are set correctly
2. **Verify DATABASE_URL** is correct
3. **Check Vercel function logs** in dashboard

### Frontend Can't Connect to API

1. **Verify VITE_API_URL** is set correctly
2. **Check CORS settings** in backend
3. **Ensure backend is deployed** and accessible

### Database Connection Issues

1. **Verify DATABASE_URL** format
2. **Check Neon database** is accessible
3. **Ensure SSL is enabled** in connection string

---

## Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your-neon-connection-string
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

---

## Quick Deploy Commands (Using Vercel CLI)

### Install Vercel CLI
```bash
npm i -g vercel
```

### Deploy Backend
```bash
cd backend
vercel
# Follow prompts
# Set environment variables when prompted
```

### Deploy Frontend
```bash
cd frontend
vercel
# Follow prompts
# Set VITE_API_URL when prompted
```

---

## Important Notes

1. **Never commit `.env` files** - Use Vercel environment variables
2. **Update CORS_ORIGIN** after frontend deployment
3. **Seed database** after first deployment
4. **Remove seed endpoint** after initial setup (if created)
5. **Use strong JWT_SECRET** in production

---

## Next Steps After Deployment

1. ✅ Test login functionality
2. ✅ Verify API endpoints work
3. ✅ Check database connection
4. ✅ Test all CRUD operations
5. ✅ Monitor Vercel logs for errors
6. ✅ Set up custom domains (optional)

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for frontend errors
3. Check Vercel function logs for backend errors
4. Verify all environment variables are set

Good luck with your deployment! 🚀

