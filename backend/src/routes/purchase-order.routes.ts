import { Router } from 'express';
import { PurchaseOrderController } from '../controllers/purchase-order.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateDto } from '../middlewares/validator.middleware';
import { ReceivePurchaseOrderDto } from '../dto/order.dto';

const router = Router();
const purchaseOrderController = new PurchaseOrderController();

router.post(
  '/:id/receive',
  authenticate,
  authorize('admin', 'warehouse_manager'),
  validateDto(ReceivePurchaseOrderDto),
  purchaseOrderController.receive
);

export default router;

