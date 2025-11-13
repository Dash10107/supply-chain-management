import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { ProductService } from '../services/product.service';
import { AppError } from '../middlewares/error-handler';

const upload = multer({ storage: multer.memoryStorage() });

export class UploadController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  uploadProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const results: any[] = [];
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const products = [];
            for (const row of results) {
              try {
                const product = await this.productService.create({
                  sku: row.sku || row.SKU,
                  name: row.name || row.Name,
                  description: row.description || row.Description,
                  price: parseFloat(row.price || row.Price || '0'),
                  cost: parseFloat(row.cost || row.Cost || '0'),
                  category: row.category || row.Category,
                  brand: row.brand || row.Brand,
                  reorderThreshold: parseInt(row.reorderThreshold || row['Reorder Threshold'] || '10'),
                  reorderQuantity: parseInt(row.reorderQuantity || row['Reorder Quantity'] || '50'),
                  unit: row.unit || row.Unit,
                  hasExpiry: row.hasExpiry === 'true' || row['Has Expiry'] === 'true',
                });
                products.push(product);
              } catch (error) {
                console.error(`Error creating product from row:`, row, error);
              }
            }

            res.json({
              status: 'success',
              message: `Successfully imported ${products.length} products`,
              data: { count: products.length },
            });
          } catch (error) {
            next(error);
          }
        })
        .on('error', (error) => {
          next(new AppError(`CSV parsing error: ${error.message}`, 400));
        });
    } catch (error) {
      next(error);
    }
  };
}

export const uploadMiddleware = upload.single('file');

