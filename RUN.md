# How to Run the Walmart SCM System

## 🚀 Quick Start (Docker - Easiest Method)

### Step 1: Make sure Docker is running
- Open Docker Desktop
- Wait for it to fully start

### Step 2: Start all services
Open a terminal in the project root and run:
```bash
docker-compose up -d
```

### Step 3: Seed the database
Wait about 30 seconds for services to start, then run:
```bash
docker-compose exec backend npm run seed
```

### Step 4: Open your browser
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs

### Step 5: Login
- Email: `admin@walmart-scms.com`
- Password: `password123`

---

## 📋 Manual Setup (Without Docker)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file:**
   - Copy `env.example` to `.env`
   - Or create `.env` manually with database credentials

3. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE walmart_scms;
   ```

4. **Start backend:**
   ```bash
   npm run dev
   ```

5. **Seed database (in new terminal):**
   ```bash
   cd backend
   npm run seed
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start frontend:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   - Go to http://localhost:5173

---

## 🛠️ Common Commands

### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build

# Access backend container
docker-compose exec backend sh
```

### Backend Commands
```bash
cd backend

# Development mode
npm run dev

# Build for production
npm run build

# Run production
npm start

# Run tests
npm test

# Seed database
npm run seed
```

### Frontend Commands
```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ❗ Troubleshooting

**Port already in use?**
- Change ports in `docker-compose.yml` or `.env` files

**Database connection error?**
- Check PostgreSQL is running
- Verify database credentials
- Make sure database `walmart_scms` exists

**Module not found?**
- Delete `node_modules` folders
- Run `npm install` again

**Docker issues?**
- Restart Docker Desktop
- Run `docker-compose down` then `docker-compose up -d --build`

