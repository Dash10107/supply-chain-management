# Fix Database Connection Error

## Error: `ECONNREFUSED` on port 5432

This means PostgreSQL is not running. Here are solutions:

---

## ✅ Solution 1: Use Docker Compose (Easiest)

This will start PostgreSQL automatically:

1. **Stop the current backend** (Ctrl+C)

2. **Start all services with Docker:**
   ```bash
   docker-compose up -d
   ```

3. **Wait 30 seconds** for PostgreSQL to start

4. **Start backend again:**
   ```bash
   cd backend
   npm run dev
   ```

5. **Seed the database:**
   ```bash
   docker-compose exec backend npm run seed
   ```

---

## ✅ Solution 2: Start PostgreSQL Manually

If you have PostgreSQL installed locally:

### Windows:
1. Open **Services** (Win + R, type `services.msc`)
2. Find **postgresql** service
3. Right-click → **Start**

Or use command:
```bash
net start postgresql-x64-15
```
(Version number may vary)

### Mac/Linux:
```bash
# Mac (with Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql
# or
sudo service postgresql start
```

### Then create the database:
```sql
-- Connect to PostgreSQL (psql or pgAdmin)
CREATE DATABASE walmart_scms;
```

---

## ✅ Solution 3: Check .env File

Make sure you have a `.env` file in the `backend` folder:

1. **Copy the example file:**
   ```bash
   cd backend
   copy env.example .env
   ```
   (On Mac/Linux: `cp env.example .env`)

2. **Edit `.env`** and update database credentials if needed:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=walmart_scms
   ```

---

## 🔍 Verify PostgreSQL is Running

### Check if PostgreSQL is listening on port 5432:

**Windows:**
```bash
netstat -an | findstr 5432
```

**Mac/Linux:**
```bash
lsof -i :5432
# or
netstat -an | grep 5432
```

If nothing shows up, PostgreSQL is not running.

---

## 🚀 Quick Fix (Recommended)

Just use Docker Compose - it handles everything:

```bash
# In project root
docker-compose up -d

# Wait 30 seconds, then
cd backend
npm run dev
```

This will:
- Start PostgreSQL automatically
- Start the backend
- Start the frontend
- All services will be connected

