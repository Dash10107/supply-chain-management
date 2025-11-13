import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const warehouseId = req.query.warehouseId as string;
      const productId = req.query.productId as string;

      const result = await this.inventoryService.findAll(
        warehouseId,
        productId,
        page,
        limit
      );
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const inventory = await this.inventoryService.findOne(id);
      res.json({
        status: 'success',
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  };
}

