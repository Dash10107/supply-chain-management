# 🚀 Deploy Backend to Vercel - Quick Reference

## One-Command Deploy

```bash
cd backend && vercel --prod
```

## Setup (First Time Only)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd backend
vercel
```

## Environment Variables (Add in Vercel Dashboard)

```
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
VERCEL=1
```

## Test Your Deployment

```bash
# Health check
curl https://your-api.vercel.app/health

# API info
curl https://your-api.vercel.app/
```

## Files Created

- ✅ `backend/api/index.ts` - Serverless entry point
- ✅ `backend/vercel.json` - Vercel configuration
- ✅ `backend/.vercelignore` - Ignore patterns

## Need Help?

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

