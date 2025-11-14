// Vercel serverless function - Main API entry point
import app from '../backend/src/index';

// Default export: handler function that forwards Node req/res to the Express app
const handler = (req: any, res: any) => {
    return app(req, res);
};

export default handler;
export { app };

// Also set CommonJS exports so Vercel (or other tooling) can require this file
(module as any).exports = app;
(module as any).exports.handler = handler;


