import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import swaggerSetup from './config/swagger';
import { rateLimiter } from './middlewares/rate-limiter';
import { errorHandler } from './middlewares/error-handler';

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

// Swagger
swaggerSetup(app);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Root
app.get('/', (_req, res) => res.json({
  name: 'Walmart SCM API',
  version: '1.0.0'
}));

// Error handler
app.use(errorHandler);

export default app;
