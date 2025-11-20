process.env.VERCEL = '1';
import request from 'supertest';
import app from '../index';

describe('Basic endpoints', () => {
  it('GET / should return root info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('version');
    expect(res.body.docs).toBe('/api-docs');
  });

  it('GET /health should return ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});
