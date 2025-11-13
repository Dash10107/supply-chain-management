# 🚀 Deploy Your API to Vercel - Step by Step

## ✅ What's Already Done

I've prepared everything for you:
- ✅ Created `backend/api/index.ts` - Serverless function entry point
- ✅ Updated `backend/vercel.json` - Vercel configuration
- ✅ Fixed database connection for serverless
- ✅ Updated TypeScript config
- ✅ Created deployment guides

## 🎯 Deploy in 3 Steps

### Step 1: Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

### Step 2: Login and Deploy

```bash
cd backend
vercel login
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (first time)
- Project name: `walmart-scms-backend` (or your choice)
- Directory: `.` (current directory)
- Override settings? **No**

### Step 3: Add Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_rfZ5u9SscXLD@ep-old-bird-ado4pv6o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

```
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-32-plus-characters
```

```
JWT_EXPIRES_IN=24h
```

```
CORS_ORIGIN=*
```

(Update this after deploying frontend)

```
NODE_ENV=production
```

```
VERCEL=1
```

5. **Redeploy**: Go to Deployments → Click "..." → "Redeploy"

## 🧪 Test Your Deployment

After deployment, you'll get a URL like: `https://walmart-scms-backend.vercel.app`

Test it:
```bash
# Health check
curl https://your-api-url.vercel.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

## 📝 Important Notes

1. **First Request**: May be slow (cold start), subsequent requests are fast
2. **Database**: Make sure your Neon database is accessible
3. **CORS**: Update `CORS_ORIGIN` after deploying frontend
4. **JWT Secret**: Use a strong, random string (at least 32 characters)

## 🔄 Update Deployment

To update your API:
```bash
cd backend
vercel --prod
```

## 📚 More Help

- See `backend/DEPLOYMENT_GUIDE.md` for detailed guide
- See `backend/VERCEL_ENV_VARS.md` for environment variables
- See `backend/QUICK_DEPLOY.md` for quick reference

## ✅ Success Checklist

After deployment, verify:
- [ ] Health endpoint works: `/health`
- [ ] API root works: `/`
- [ ] Database connects (check logs)
- [ ] No errors in Vercel dashboard
- [ ] Environment variables are set

---

**Ready to deploy? Run these commands:**

```bash
cd backend
vercel login
vercel
```

Then add environment variables in Vercel dashboard and redeploy!

