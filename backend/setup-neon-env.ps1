# PowerShell script to setup .env file with Neon database connection

$envContent = @"
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration - Neon PostgreSQL
# Using connection string (recommended for Neon)
DATABASE_URL=postgresql://neondb_owner:npg_rfZ5u9SscXLD@ep-old-bird-ado4pv6o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Alternative: Individual parameters (if not using DATABASE_URL above)
# Uncomment these if you prefer individual parameters:
# DB_HOST=ep-old-bird-ado4pv6o-pooler.c-2.us-east-1.aws.neon.tech
# DB_PORT=5432
# DB_USERNAME=neondb_owner
# DB_PASSWORD=npg_rfZ5u9SscXLD
# DB_NAME=neondb

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8
Write-Host "✅ .env file created successfully with Neon database configuration!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure your Neon database 'neondb' exists" -ForegroundColor Cyan
Write-Host "2. Run: npm run dev" -ForegroundColor Cyan
Write-Host "3. Run: npm run seed (to populate database)" -ForegroundColor Cyan

