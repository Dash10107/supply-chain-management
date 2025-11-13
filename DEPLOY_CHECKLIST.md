# Pre-Deployment Checklist

## Before Deploying to Vercel

### ✅ Code Preparation

- [ ] All code is committed to GitHub
- [ ] No console.log statements in production code
- [ ] Error handling is in place
- [ ] Environment variables are documented
- [ ] `.env` files are in `.gitignore`

### ✅ Backend Checks

- [ ] `npm run build` works locally
- [ ] TypeScript compiles without errors
- [ ] All dependencies are in `package.json`
- [ ] Database connection string is ready
- [ ] JWT_SECRET is set (use a strong secret)
- [ ] CORS_ORIGIN is configured

### ✅ Frontend Checks

- [ ] `npm run build` works locally
- [ ] TypeScript compiles without errors
- [ ] All dependencies are in `package.json`
- [ ] API URL is configured via environment variable
- [ ] Build output is in `dist/` folder
- [ ] No hardcoded localhost URLs

### ✅ Database

- [ ] Neon database is set up
- [ ] Connection string is ready
- [ ] Database is accessible
- [ ] Plan for seeding data after deployment

### ✅ Security

- [ ] JWT_SECRET is strong and unique
- [ ] No secrets in code
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place

### ✅ Testing

- [ ] Test build locally: `cd backend && npm run build`
- [ ] Test build locally: `cd frontend && npm run build`
- [ ] Test API endpoints locally
- [ ] Test frontend locally

---

## Deployment Steps

1. [ ] Push code to GitHub
2. [ ] Deploy backend first
3. [ ] Copy backend URL
4. [ ] Deploy frontend with backend URL
5. [ ] Update backend CORS with frontend URL
6. [ ] Seed database
7. [ ] Test deployment
8. [ ] Update documentation

---

## Post-Deployment

- [ ] Test login
- [ ] Test API endpoints
- [ ] Check Vercel logs
- [ ] Monitor for errors
- [ ] Update CORS if needed
- [ ] Set up custom domain (optional)

