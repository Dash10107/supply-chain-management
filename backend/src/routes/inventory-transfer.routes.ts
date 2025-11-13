import { Router } from 'express';
import { InventoryTransferController } from '../controllers/inventory-transfer.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const transferController = new InventoryTransferController();

router.post(
  '/',
  authenticate,
  authorize('admin', 'warehouse_manager', 'logistics'),
  transferController.transfer
);

export default router;

