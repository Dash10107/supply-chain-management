import "reflect-metadata";
import { config } from "dotenv";
config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { AppDataSource } from "../backend/src/config/data-source";
import { errorHandler } from "../backend/src/middlewares/error-handler";
import { rateLimiter } from "../backend/src/middlewares/rate-limiter";
import routes from "../backend/src/routes";
import swaggerSetup from "../backend/src/config/swagger";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Swagger
swaggerSetup(app);

// API Routes
app.use("/api", routes);

// Health check
app.get("/health", (_, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// --- Database Initialization (safe for serverless) ---
let initialized = false;

async function initDB() {
  if (!initialized) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    initialized = true;
  }
}

// --- Vercel Handler ---
export default async function handler(req, res) {
  await initDB();
  return app(req, res);
}
