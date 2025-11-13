# Quick Deploy to Vercel

## Fastest Way (Using Vercel CLI)

```bash
# 1. Install Vercel CLI (if not installed)
npm install -g vercel

# 2. Navigate to backend directory
cd backend

# 3. Login to Vercel
vercel login

# 4. Deploy
vercel

# 5. Set environment variables in Vercel dashboard
# Go to: Project Settings → Environment Variables
# Add:
#   DATABASE_URL=your_neon_connection_string
#   JWT_SECRET=your-secret-key
#   CORS_ORIGIN=https://your-frontend-url.vercel.app
#   NODE_ENV=production
#   VERCEL=1

# 6. Redeploy with environment variables
vercel --prod
```

## Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure:
   - **Root Directory**: `backend`
   - **Framework**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: (leave empty)
4. Add environment variables (see above)
5. Deploy!

## Your API will be available at:
`https://your-project-name.vercel.app`

Test it: `https://your-project-name.vercel.app/health`

