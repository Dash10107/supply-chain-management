import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

// Support both connection string (Neon) and individual parameters
const getDataSourceConfig = () => {
  // If DATABASE_URL is provided (Neon connection string), use it
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
      synchronize: false, // Never use synchronize in production
      logging: false, // Disable logging in production
      entities: [process.env.VERCEL === '1' ? 'dist/schemas/**/*.js' : 'src/schemas/**/*.ts'],
      migrations: [process.env.VERCEL === '1' ? 'dist/database/migrations/**/*.js' : 'src/database/migrations/**/*.ts'],
      subscribers: [process.env.VERCEL === '1' ? 'dist/database/subscribers/**/*.js' : 'src/database/subscribers/**/*.ts'],
      ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    };
  }

  // Otherwise, use individual connection parameters
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'walmart_scms',
    synchronize: false, // Never use synchronize in production
    logging: false, // Disable logging in production
    entities: [process.env.VERCEL === '1' ? 'dist/schemas/**/*.js' : 'src/schemas/**/*.ts'],
    migrations: [process.env.VERCEL === '1' ? 'dist/database/migrations/**/*.js' : 'src/database/migrations/**/*.ts'],
    subscribers: [process.env.VERCEL === '1' ? 'dist/database/subscribers/**/*.js' : 'src/database/subscribers/**/*.ts'],
    ssl: process.env.DB_HOST?.includes('neon.tech') || process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  };
};

export const AppDataSource = new DataSource(getDataSourceConfig());

