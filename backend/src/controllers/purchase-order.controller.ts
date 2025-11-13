import { Request, Response, NextFunction } from 'express';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { ReceivePurchaseOrderDto } from '../dto/order.dto';

export class PurchaseOrderController {
  private purchaseOrderService: PurchaseOrderService;

  constructor() {
    this.purchaseOrderService = new PurchaseOrderService();
  }

  receive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const receiveDto = req.body as ReceivePurchaseOrderDto;
      const order = await this.purchaseOrderService.receivePurchaseOrder(id, receiveDto);
      res.json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };
}

