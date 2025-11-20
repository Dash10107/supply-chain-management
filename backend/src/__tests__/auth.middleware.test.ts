jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('../config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';

describe('authenticate middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('responds 401 when no token provided', async () => {
    const { authenticate } = await import('../middlewares/auth.middleware');

    const req: any = { headers: {} };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Authentication required' });
  });

  it('sets req.user and calls next when token valid and user active', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'u1' });

    const fakeUser = { id: 'u1', status: 'active', role: { name: 'admin' } };
    const repoMock = { findOne: jest.fn().mockResolvedValue(fakeUser) };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(repoMock);

    const { authenticate } = await import('../middlewares/auth.middleware');

    const req: any = { headers: { authorization: 'Bearer token' } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(AppDataSource.getRepository).toHaveBeenCalled();
    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
  });

  it('responds 401 when user inactive or not found', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'u2' });
    const repoMock = { findOne: jest.fn().mockResolvedValue(null) };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(repoMock);

    const { authenticate } = await import('../middlewares/auth.middleware');

    const req: any = { headers: { authorization: 'Bearer token' } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Invalid or inactive user' });
  });

  it('responds 401 when jwt.verify throws', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('bad'); });

    const { authenticate } = await import('../middlewares/auth.middleware');

    const req: any = { headers: { authorization: 'Bearer token' } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });
});

describe('authorize middleware', () => {
  it('responds 401 when req.user missing', () => {
    const { authorize } = require('../middlewares/auth.middleware');
    const middleware = authorize('admin');

    const req: any = {};
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const next = jest.fn();

    middleware(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Authentication required' });
  });

  it('responds 403 when role not allowed', () => {
    const { authorize } = require('../middlewares/auth.middleware');
    const middleware = authorize('admin');

    const req: any = { user: { role: { name: 'user' } } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const next = jest.fn();

    middleware(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
  });

  it('calls next when role allowed', () => {
    const { authorize } = require('../middlewares/auth.middleware');
    const middleware = authorize('admin', 'user');

    const req: any = { user: { role: { name: 'user' } } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
