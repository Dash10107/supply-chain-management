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

const initializeDatabase = async () => {
  if (!dbInitialized) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('Database connected successfully');
      }
      dbInitialized = true;
    } catch (error) {
      console.error('Error during database initialization:', error);
      // Don't throw - allow the app to continue
      // The connection will be retried on next request
    }
  }
};

// Initialize database before handling requests
app.use(async (req, res, next) => {
  await initializeDatabase();
  next();
});

// Export for Vercel serverless
export default app;
