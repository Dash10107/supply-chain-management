# Deploy to Vercel - Simple Steps

## Step 1: Deploy Backend

```bash
cd backend
npm install -g vercel
vercel login
vercel
```

**When prompted:**
- Set up and deploy? **Yes**
- Link to existing project? **No** (first time)
- Project name: `walmart-scms-backend`
- Directory: `.`

**After deployment, note your backend URL** (e.g., `https://walmart-scms-backend.vercel.app`)

## Step 2: Add Backend Environment Variables

Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables

Add these:
```
DATABASE_URL=postgresql://neondb_owner:npg_rfZ5u9SscXLD@ep-old-bird-ado4pv6o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*
NODE_ENV=production
VERCEL=1
```

Then **Redeploy** the backend.

## Step 3: Deploy Frontend

```bash
cd frontend
vercel
```

**When prompted:**
- Set up and deploy? **Yes**
- Link to existing project? **No** (first time)
- Project name: `walmart-scms-frontend`
- Directory: `.`

## Step 4: Add Frontend Environment Variable

Go to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

Add:
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

Replace `your-backend-url.vercel.app` with your actual backend URL from Step 1.

Then **Redeploy** the frontend.

## Done! 🎉

Your apps are now live:
- Frontend: `https://walmart-scms-frontend.vercel.app`
- Backend: `https://walmart-scms-backend.vercel.app`

## Test

1. Visit your frontend URL
2. Login with: `admin@walmart-scms.com` / `password123`
3. Everything should work!

