# Vercel Environment Variables

Copy these environment variables to your Vercel project settings:

## Required Variables

```
DATABASE_URL=postgresql://neondb_owner:npg_rfZ5u9SscXLD@ep-old-bird-ado4pv6o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

```
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

```
JWT_EXPIRES_IN=24h
```

```
CORS_ORIGIN=https://your-frontend-url.vercel.app
```
(Replace with your actual frontend URL after deploying)

```
NODE_ENV=production
```

```
VERCEL=1
```

## How to Add in Vercel

1. Go to your project on Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select **Production**, **Preview**, and **Development**
4. Click **Save**
5. **Redeploy** your project for changes to take effect

## Important Notes

- **DATABASE_URL**: Use your Neon PostgreSQL connection string
- **JWT_SECRET**: Must be at least 32 characters long, use a strong random string
- **CORS_ORIGIN**: Update this after deploying your frontend
- **VERCEL**: Set to `1` to enable Vercel-specific configurations

## Security

- Never commit `.env` files to Git
- Use Vercel's environment variables for all secrets
- Rotate JWT_SECRET regularly in production
- Use different secrets for production and development

