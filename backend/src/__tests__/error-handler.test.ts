import { errorHandler, AppError } from '../middlewares/error-handler';

describe('errorHandler middleware', () => {
  it('handles AppError correctly', () => {
    const err = new AppError('Not found', 404);
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const req: any = {};
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ status: 'error', message: 'Not found' });
  });

  it('handles validation errors array', () => {
    const validationErr = [
      { constraints: { isNotEmpty: 'name should not be empty' } },
      { constraints: { isEmail: 'email must be an email' } },
    ] as any;

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const req: any = {};
    const next = jest.fn();

    errorHandler(validationErr, req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Validation failed',
        errors: expect.any(Array),
      })
    );
  });

  it('handles generic errors (dev mode)', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('Something broke');
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const req: any = {};
    const next = jest.fn();

    // prevent console.error from cluttering test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ status: 'error', message: 'Something broke' });

    consoleSpy.mockRestore();
  });
});
