# Deploy Backend API to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```

## Step-by-Step Deployment

### Step 1: Prepare Your Code

1. Make sure all changes are committed:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

### Step 2: Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

### Step 3: Login to Vercel

```bash
vercel login
```

### Step 4: Navigate to Backend Directory

```bash
cd backend
```

### Step 5: Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (first time) or **Yes** (if updating)
- Project name: `walmart-scms-backend` (or your preferred name)
- Directory: `.` (current directory)
- Override settings? **No**

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty (not needed for serverless)
   - **Install Command**: `npm install`

### Step 6: Configure Environment Variables

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add the following variables:

```
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend-url.vercel.app
NODE_ENV=production
VERCEL=1
```

**Important**: 
- Replace `your_neon_postgresql_connection_string` with your actual Neon connection string
- Replace `your-frontend-url.vercel.app` with your frontend deployment URL
- Make sure `JWT_SECRET` is a strong, random string

### Step 7: Redeploy After Adding Environment Variables

After adding environment variables, trigger a new deployment:
- Go to Deployments tab
- Click "..." on the latest deployment
- Select "Redeploy"

Or use CLI:
```bash
vercel --prod
```

### Step 8: Verify Deployment

1. Check your deployment URL (e.g., `https://walmart-scms-backend.vercel.app`)
2. Test health endpoint: `https://your-api-url.vercel.app/health`
3. Test API: `https://your-api-url.vercel.app/api/products`

## Configuration Files

### vercel.json
Located in `backend/vercel.json`, this file configures:
- Build command
- Serverless function settings
- Routes
- Runtime environment

### api/index.ts
This is the serverless function entry point that:
- Initializes Express app
- Sets up middleware
- Handles database connection
- Exports the app for Vercel

## Troubleshooting

### Issue: Database Connection Fails

**Solution**:
1. Verify `DATABASE_URL` is set correctly in Vercel environment variables
2. Check that your Neon database allows connections from Vercel IPs
3. Ensure SSL is enabled in connection string

### Issue: Build Fails

**Solution**:
1. Check that all dependencies are in `package.json`
2. Verify TypeScript compiles: `npm run build`
3. Check build logs in Vercel dashboard

### Issue: Function Timeout

**Solution**:
1. Increase `maxDuration` in `vercel.json` (max 60s on Pro plan)
2. Optimize database queries
3. Consider using connection pooling

### Issue: CORS Errors

**Solution**:
1. Update `CORS_ORIGIN` in environment variables
2. Add your frontend URL to allowed origins
3. Redeploy after updating

### Issue: Module Not Found

**Solution**:
1. Ensure all imports use relative paths
2. Check that `tsconfig.json` is configured correctly
3. Verify build output includes all necessary files

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-random-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration | `24h` |
| `CORS_ORIGIN` | Allowed CORS origin | `https://your-frontend.vercel.app` |
| `NODE_ENV` | Environment | `production` |
| `VERCEL` | Vercel flag | `1` |

## Updating Your Deployment

To update your deployment:

```bash
cd backend
vercel --prod
```

Or push to your Git repository (if connected):
```bash
git push
```

Vercel will automatically deploy on push if you've connected your Git repository.

## Production Checklist

- [ ] All environment variables are set
- [ ] Database connection is working
- [ ] CORS is configured correctly
- [ ] Health endpoint responds
- [ ] API endpoints are accessible
- [ ] JWT authentication works
- [ ] Error handling is working
- [ ] Logs are being captured

## Next Steps

After deploying the backend:
1. Update frontend `VITE_API_URL` to point to your Vercel backend URL
2. Deploy frontend to Vercel
3. Test the complete application
4. Set up monitoring and alerts

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review function logs in Vercel dashboard
3. Test endpoints using Postman or curl
4. Verify environment variables are set correctly

