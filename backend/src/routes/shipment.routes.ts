import { Router } from 'express';
import { ShipmentController } from '../controllers/shipment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const shipmentController = new ShipmentController();

router.post(
  '/',
  authenticate,
  authorize('admin', 'logistics', 'warehouse_manager'),
  shipmentController.create
);
router.get('/', authenticate, shipmentController.findAll);
router.get('/:id', authenticate, shipmentController.findOne);
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'logistics', 'warehouse_manager'),
  shipmentController.updateStatus
);

export default router;

