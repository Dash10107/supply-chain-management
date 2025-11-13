# Quick Start Guide

## Option 1: Using Docker (Easiest - Recommended)

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed

### Steps

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Wait for services to be ready** (about 30 seconds)

3. **Seed the database with sample data:**
   ```bash
   docker-compose exec backend npm run seed
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs

5. **Login credentials:**
   - Email: `admin@walmart-scms.com`
   - Password: `password123`

### Stop services:
```bash
docker-compose down
```

### View logs:
```bash
docker-compose logs -f
```

---

## Option 2: Manual Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 15+ installed and running

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   # Copy the example (or create manually)
   # Create .env file with these contents:
   ```
   
   Create `backend/.env` with:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=walmart_scms
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:5173
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Create PostgreSQL database:**
   ```sql
   -- Connect to PostgreSQL and run:
   CREATE DATABASE walmart_scms;
   ```

5. **Start the backend:**
   ```bash
   npm run dev
   ```

6. **In a new terminal, seed the database:**
   ```bash
   cd backend
   npm run seed
   ```

### Frontend Setup

1. **Open a new terminal and navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

---

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running
- Check database credentials in `.env`
- Verify database `walmart_scms` exists

### Port Already in Use
- Change ports in `docker-compose.yml` or `.env` files
- Kill processes using ports 3000 or 5173

### Docker Issues
- Make sure Docker Desktop is running
- Try: `docker-compose down` then `docker-compose up -d --build`

### Module Not Found Errors
- Run `npm install` in both backend and frontend directories
- Delete `node_modules` and `package-lock.json`, then reinstall

