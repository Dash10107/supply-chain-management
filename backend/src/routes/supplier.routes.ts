import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const supplierController = new SupplierController();

router.get('/', authenticate, supplierController.findAll);
router.get('/:id', authenticate, supplierController.findOne);
router.post(
  '/',
  authenticate,
  authorize('admin', 'procurement'),
  supplierController.create
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'procurement'),
  supplierController.update
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  supplierController.delete
);

export default router;

