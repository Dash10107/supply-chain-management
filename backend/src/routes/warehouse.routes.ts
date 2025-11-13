import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const warehouseController = new WarehouseController();

router.get('/', authenticate, warehouseController.findAll);
router.get('/:id', authenticate, warehouseController.findOne);
router.post(
  '/',
  authenticate,
  authorize('admin', 'warehouse_manager'),
  warehouseController.create
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'warehouse_manager'),
  warehouseController.update
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  warehouseController.delete
);

export default router;

