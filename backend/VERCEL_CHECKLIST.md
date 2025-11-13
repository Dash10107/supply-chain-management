# ✅ Vercel Deployment Checklist

## Before Deploying

- [ ] Code is committed to Git
- [ ] All dependencies are in `package.json`
- [ ] TypeScript compiles: `npm run build` (test locally)
- [ ] Database is accessible (test connection)
- [ ] Environment variables list is ready

## During Deployment

- [ ] Vercel CLI is installed: `npm install -g vercel`
- [ ] Logged in: `vercel login`
- [ ] Deployed: `vercel` or via dashboard
- [ ] Project name is set correctly
- [ ] Root directory is `backend` (if using dashboard)

## After Deployment

- [ ] Environment variables are added in Vercel dashboard
- [ ] All 6 required variables are set:
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET
  - [ ] JWT_EXPIRES_IN
  - [ ] CORS_ORIGIN
  - [ ] NODE_ENV
  - [ ] VERCEL
- [ ] Project is redeployed after adding env vars
- [ ] Health endpoint works: `/health`
- [ ] API root works: `/`
- [ ] Database connection works (check logs)
- [ ] No errors in deployment logs

## Testing

- [ ] Health check: `GET /health` returns 200
- [ ] API info: `GET /` returns API info
- [ ] Authentication: Login endpoint works
- [ ] Protected routes: Require authentication
- [ ] Database queries: Return data correctly

## Post-Deployment

- [ ] Frontend `VITE_API_URL` is updated
- [ ] CORS is configured correctly
- [ ] Monitoring is set up
- [ ] Documentation is updated with new URL

---

## Quick Commands

```bash
# Deploy
cd backend && vercel

# Deploy to production
cd backend && vercel --prod

# View logs
vercel logs

# Check deployment status
vercel ls
```

---

## Your API URL

After deployment, your API will be available at:
`https://your-project-name.vercel.app`

Update your frontend to use this URL!

