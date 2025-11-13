import { Response, NextFunction } from 'express';
import { InventoryTransferService } from '../services/inventory-transfer.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class InventoryTransferController {
  private transferService: InventoryTransferService;

  constructor() {
    this.transferService = new InventoryTransferService();
  }

  transfer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId, fromWarehouseId, toWarehouseId, quantity } = req.body;

      if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      await this.transferService.transferInventory(
        productId,
        fromWarehouseId,
        toWarehouseId,
        parseInt(quantity),
        req.user?.id
      );

      res.json({
        status: 'success',
        message: 'Inventory transferred successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

