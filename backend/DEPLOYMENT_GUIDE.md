# Complete Vercel Deployment Guide for Backend API

## 🚀 Quick Start (5 Minutes)

### Method 1: Using Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Navigate to backend directory
cd backend

# 3. Login to Vercel
vercel login

# 4. Deploy (follow prompts)
vercel

# 5. Add environment variables in Vercel Dashboard
# (See VERCEL_ENV_VARS.md for list)

# 6. Deploy to production
vercel --prod
```

### Method 2: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`
4. Add environment variables (see below)
5. Click **Deploy**

---

## 📋 Environment Variables Setup

### Required Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Your Neon connection string | PostgreSQL connection |
| `JWT_SECRET` | Random 32+ character string | JWT token secret |
| `JWT_EXPIRES_IN` | `24h` | Token expiration |
| `CORS_ORIGIN` | Your frontend URL | Allowed CORS origin |
| `NODE_ENV` | `production` | Environment |
| `VERCEL` | `1` | Vercel flag |

### Example Values

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
VERCEL=1
```

**Important**: 
- Replace `your-frontend.vercel.app` with your actual frontend URL
- Use a strong, random `JWT_SECRET` (at least 32 characters)
- Set all variables for **Production**, **Preview**, and **Development** environments

---

## 🔧 Project Structure

```
backend/
├── api/
│   └── index.ts          # Vercel serverless entry point
├── src/
│   ├── config/
│   │   └── data-source.ts
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   └── schemas/
├── vercel.json          # Vercel configuration
├── tsconfig.json        # TypeScript config
└── package.json
```

---

## ✅ Pre-Deployment Checklist

- [ ] Code is committed to Git
- [ ] All dependencies are in `package.json`
- [ ] TypeScript compiles: `npm run build`
- [ ] Database migrations are run (if needed)
- [ ] Environment variables are ready
- [ ] Neon database is accessible
- [ ] CORS origin is set correctly

---

## 🧪 Testing Deployment

After deployment, test these endpoints:

1. **Health Check**:
   ```
   GET https://your-api.vercel.app/health
   ```
   Expected: `{"status":"ok","timestamp":"..."}`

2. **API Root**:
   ```
   GET https://your-api.vercel.app/
   ```
   Expected: API info

3. **Products** (requires auth):
   ```
   GET https://your-api.vercel.app/api/products
   ```
   Expected: Products list or 401 if not authenticated

---

## 🔍 Troubleshooting

### Issue: Build Fails

**Symptoms**: Deployment fails during build

**Solutions**:
1. Check build logs in Vercel dashboard
2. Test build locally: `cd backend && npm run build`
3. Verify all dependencies are in `package.json`
4. Check TypeScript errors: `npm run build`

### Issue: Function Timeout

**Symptoms**: Requests timeout after 10 seconds

**Solutions**:
1. Increase `maxDuration` in `vercel.json` (max 60s on Pro)
2. Optimize database queries
3. Use connection pooling
4. Check for slow operations

### Issue: Database Connection Fails

**Symptoms**: 500 errors, database connection errors

**Solutions**:
1. Verify `DATABASE_URL` is correct
2. Check Neon database is running
3. Ensure SSL is enabled in connection string
4. Verify database allows connections from Vercel IPs
5. Check connection string format

### Issue: CORS Errors

**Symptoms**: Frontend can't access API

**Solutions**:
1. Update `CORS_ORIGIN` in environment variables
2. Add frontend URL to allowed origins
3. Redeploy after updating
4. Check browser console for specific CORS error

### Issue: Module Not Found

**Symptoms**: `Cannot find module` errors

**Solutions**:
1. Verify all imports use relative paths
2. Check `tsconfig.json` includes all files
3. Ensure build output includes all modules
4. Check `package.json` has all dependencies

### Issue: JWT Authentication Fails

**Symptoms**: Login works but subsequent requests fail

**Solutions**:
1. Verify `JWT_SECRET` is set correctly
2. Check token expiration settings
3. Ensure frontend sends token in headers
4. Verify token format

---

## 📊 Monitoring

### Vercel Dashboard

- **Deployments**: View all deployments
- **Functions**: Monitor serverless function performance
- **Logs**: View real-time logs
- **Analytics**: Track usage and performance

### Health Monitoring

Set up monitoring for:
- `/health` endpoint
- Response times
- Error rates
- Database connection status

---

## 🔄 Updating Deployment

### Option 1: Git Push (Auto-Deploy)

If connected to Git:
```bash
git add .
git commit -m "Update API"
git push
```
Vercel will automatically deploy.

### Option 2: Manual Deploy

```bash
cd backend
vercel --prod
```

---

## 🎯 Post-Deployment Steps

1. **Test All Endpoints**: Verify API works correctly
2. **Update Frontend**: Set `VITE_API_URL` to your Vercel backend URL
3. **Monitor Logs**: Check for any errors
4. **Set Up Alerts**: Configure monitoring alerts
5. **Documentation**: Update API documentation with new URL

---

## 📝 Important Notes

1. **Database Migrations**: Run migrations manually before deployment or use a migration service
2. **Connection Pooling**: Consider using Neon's connection pooling for better performance
3. **Cold Starts**: First request may be slower (cold start), subsequent requests are fast
4. **Function Limits**: 
   - Free tier: 10s timeout, 100GB bandwidth
   - Pro tier: 60s timeout, 1TB bandwidth
5. **Environment Variables**: Changes require redeployment

---

## 🆘 Getting Help

If you encounter issues:

1. Check Vercel deployment logs
2. Review function logs in dashboard
3. Test endpoints with Postman/curl
4. Verify environment variables
5. Check database connection
6. Review error messages in browser console

---

## ✨ Success Indicators

Your deployment is successful when:

- ✅ Health endpoint returns 200
- ✅ API endpoints respond correctly
- ✅ Database connections work
- ✅ Authentication works
- ✅ No errors in logs
- ✅ Frontend can connect to API

---

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Neon PostgreSQL](https://neon.tech/docs)
- [TypeORM Documentation](https://typeorm.io/)

---

**Your API URL will be**: `https://your-project-name.vercel.app`

**Test it**: `https://your-project-name.vercel.app/health`

