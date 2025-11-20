jest.mock('../services/product.service', () => ({
  ProductService: jest.fn().mockImplementation(() => ({
    create: jest.fn().mockResolvedValue({ id: 'p1' }),
  })),
}));

import { UploadController } from '../controllers/upload.controller';
import { AppError } from '../middlewares/error-handler';

describe('UploadController.uploadProducts', () => {
  afterEach(() => jest.clearAllMocks());

  it('forwards AppError when no file is provided', async () => {
    const controller = new UploadController();
    const req: any = {}; // no file
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const next = jest.fn();

    await controller.uploadProducts(req, res, next);

    expect(next).toHaveBeenCalled();
    const calledWith = next.mock.calls[0][0];
    expect(calledWith).toBeInstanceOf(AppError);
    expect(calledWith.message).toBe('No file uploaded');
  });

  it('parses CSV and returns created count', async () => {
    const controller = new UploadController();
    const csv = `sku,name,price\nsku1,Product 1,10\nsku2,Product 2,20\n`;
    const req: any = { file: { buffer: Buffer.from(csv) } };

    // capture json call
    let responseData: any = null;
    const json = jest.fn((obj) => { responseData = obj; });
    const res: any = { json };
    const next = jest.fn();

    // uploadProducts uses stream events - wait until json is called
    await new Promise<void>((resolve) => {
      controller.uploadProducts(req, res, (err: any) => {
        if (err) throw err;
      });

      // poll for responseData
      const interval = setInterval(() => {
        if (responseData) {
          clearInterval(interval);
          resolve();
        }
      }, 20);
    });

    expect(responseData).toBeTruthy();
    expect(responseData.status).toBe('success');
    expect(responseData.data).toHaveProperty('count', 2);
  });
});
