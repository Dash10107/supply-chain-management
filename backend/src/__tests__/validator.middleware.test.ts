jest.mock('class-validator', () => ({
  validate: jest.fn(),
}));

jest.mock('class-transformer', () => ({
  plainToInstance: jest.fn((cls: any, body: any) => ({ ...body })),
}));

import { validate } from 'class-validator';
import { validateDto } from '../middlewares/validator.middleware';

describe('validateDto middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls next with errors when validation fails', async () => {
    (validate as jest.Mock).mockResolvedValue([{ constraints: { isNotEmpty: 'error' } }]);

    const dto = class {};
    const middleware = validateDto(dto);

    const req: any = { body: { name: '' } };
    const res: any = {};
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const calledWith = next.mock.calls[0][0];
    expect(Array.isArray(calledWith)).toBe(true);
  });

  it('transforms body and calls next when validation passes', async () => {
    (validate as jest.Mock).mockResolvedValue([]);

    const dto = class {};
    const middleware = validateDto(dto);

    const req: any = { body: { name: 'ok' } };
    const res: any = {};
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'ok' });
  });
});
