describe('rateLimiter export', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('passes parsed options to express-rate-limit', () => {
    // set env values
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '10';

    // mock express-rate-limit to capture options
    jest.mock('express-rate-limit', () => {
      return jest.fn((opts: any) => opts);
    });

    const { rateLimiter } = require('../middlewares/rate-limiter');

    expect(rateLimiter).toHaveProperty('windowMs', 60000);
    expect(rateLimiter).toHaveProperty('max', 10);
    expect(rateLimiter).toHaveProperty('message');
  });
});
