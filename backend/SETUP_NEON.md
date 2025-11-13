# Setup Neon Database Connection

## Quick Setup

### Option 1: Run the PowerShell script (Windows)
```powershell
cd backend
.\setup-neon-env.ps1
```

### Option 2: Manual Setup

Create or update `backend/.env` file with this content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration - Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:npg_rfZ5u9SscXLD@ep-old-bird-ado4pv6o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Important Notes

1. **Database Name**: The connection string uses `neondb` as the database name. 
   - If you want to use a different name (like `walmart_scms`), you need to create it in Neon first
   - Or update the connection string to use your preferred database name

2. **Create Database in Neon** (if needed):
   ```sql
   -- Connect to Neon and run:
   CREATE DATABASE walmart_scms;
   ```
   Then update the connection string to use `walmart_scms` instead of `neondb`

3. **Test Connection**:
   ```bash
   cd backend
   npm run dev
   ```

4. **Seed Database** (after connection works):
   ```bash
   npm run seed
   ```

## Verify Connection

The backend will automatically:
- Connect to Neon using the DATABASE_URL
- Enable SSL (required for Neon)
- Create tables automatically (in development mode)

If you see "Database connected successfully" in the console, you're good to go! 🎉

