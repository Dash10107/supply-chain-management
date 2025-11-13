import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateDto } from '../middlewares/validator.middleware';
import { CreateSalesOrderDto, CreatePurchaseOrderDto } from '../dto/order.dto';

const router = Router();
const orderController = new OrderController();

// Sales Orders
router.post(
  '/',
  authenticate,
  authorize('admin', 'sales'),
  validateDto(CreateSalesOrderDto),
  orderController.createSalesOrder
);
router.get('/', authenticate, orderController.findAllSalesOrders);
router.get('/:id', authenticate, orderController.findSalesOrder);
router.patch(
  '/:id/cancel',
  authenticate,
  authorize('admin', 'sales'),
  orderController.cancelSalesOrder
);

// Purchase Orders
router.post(
  '/purchase',
  authenticate,
  authorize('admin', 'procurement'),
  validateDto(CreatePurchaseOrderDto),
  orderController.createPurchaseOrder
);
router.get('/purchase', authenticate, orderController.findAllPurchaseOrders);
router.get('/purchase/:id', authenticate, orderController.findPurchaseOrder);

export default router;

