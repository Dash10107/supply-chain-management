process.env.VERCEL = '1';
// create a shared repo mock so tests can control returned data before app import
const sharedRepo: any = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

jest.mock('../config/data-source', () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
    getRepository: jest.fn(() => sharedRepo),
  },
}));
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../config/data-source';
import bcrypt from 'bcryptjs';

describe('Auth API', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // setup repository and bcrypt for valid login (sharedRepo is returned by getRepository)
      const repo: any = (AppDataSource.getRepository as jest.Mock)();
      repo.findOne.mockResolvedValue({
        id: 'u1',
        email: 'admin@walmart-scms.com',
        password: 'hashed',
        firstName: 'Admin',
        lastName: 'User',
        role: { name: 'admin' },
        status: 'active',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@walmart-scms.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should fail with invalid credentials', async () => {
      // setup repository and bcrypt for invalid login
      const repo: any = (AppDataSource.getRepository as jest.Mock)();
      repo.findOne.mockResolvedValue({
        id: 'u1',
        email: 'admin@walmart-scms.com',
        password: 'hashed',
        firstName: 'Admin',
        lastName: 'User',
        role: { name: 'admin' },
        status: 'active',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@walmart-scms.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});

