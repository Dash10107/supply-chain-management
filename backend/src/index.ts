import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { AppDataSource } from './config/data-source';
import { errorHandler } from './middlewares/error-handler';
import { rateLimiter } from './middlewares/rate-limiter';
import routes from './routes';
import swaggerSetup from './config/swagger';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
  void req;
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  void req;
  res.json({ 
    message: 'Walmart SCM API',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
// For Vercel, we don't start the server - it's serverless
if (process.env.VERCEL !== '1') {
  AppDataSource.initialize()
    .then(() => {
      console.log('Database connected successfully');
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
      });
    })
    .catch((error) => {
      console.error('Error during database initialization:', error);
      process.exit(1);
    });
}

// Export for Vercel serverless
export default app;
