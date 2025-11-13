import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { AppDataSource } from '../src/config/data-source';
import { errorHandler } from '../src/middlewares/error-handler';
import { rateLimiter } from '../src/middlewares/rate-limiter';
import routes from '../src/routes';
import swaggerSetup from '../src/config/swagger';

// Load environment variables
config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Swagger documentation
swaggerSetup(app);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Walmart SCM API',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize database connection (for serverless)
let dbInitialized = false;
let dbInitializing = false;

const initializeDatabase = async () => {
  if (dbInitialized) {
    return;
  }

  if (dbInitializing) {
    // Wait for ongoing initialization
    while (dbInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  dbInitializing = true;
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database connected successfully');
    }
    dbInitialized = true;
  } catch (error) {
    console.error('Error during database initialization:', error);
    // Reset flag to allow retry
    dbInitialized = false;
  } finally {
    dbInitializing = false;
  }
};

// Initialize database before handling requests
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
  next();
});

// Export for Vercel serverless
export default app;
