import type { VercelRequest, VercelResponse } from '@vercel/node';
import 'reflect-metadata';
import { config } from 'dotenv';
import { AppDataSource } from '../src/config/data-source';
import app from '../src/app';

config();

let dbInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!dbInitialized) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      dbInitialized = true;
      console.log('DB initialized');
    } catch (err) {
      console.error('DB error:', err);
    }
  }

  return app(req, res);
}
