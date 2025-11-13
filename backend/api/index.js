"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = require("dotenv");
const data_source_1 = require("../src/config/data-source");
const error_handler_1 = require("../src/middlewares/error-handler");
const rate_limiter_1 = require("../src/middlewares/rate-limiter");
const routes_1 = __importDefault(require("../src/routes"));
const swagger_1 = __importDefault(require("../src/config/swagger"));
// Load environment variables
(0, dotenv_1.config)();
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(rate_limiter_1.rateLimiter);
// Swagger documentation
(0, swagger_1.default)(app);
// Routes
app.use('/api', routes_1.default);
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
app.use(error_handler_1.errorHandler);
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
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            console.log('Database connected successfully');
        }
        dbInitialized = true;
    }
    catch (error) {
        console.error('Error during database initialization:', error);
        // Reset flag to allow retry
        dbInitialized = false;
    }
    finally {
        dbInitializing = false;
    }
};
// Initialize database before handling requests
app.use(async (req, res, next) => {
    try {
        await initializeDatabase();
    }
    catch (error) {
        console.error('Database initialization error:', error);
    }
    next();
});
// Export for Vercel serverless
exports.default = app;
