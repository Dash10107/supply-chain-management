import { Router } from 'express';
import { ReturnController } from '../controllers/return.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const returnController = new ReturnController();

router.post(
  '/',
  authenticate,
  authorize('admin', 'sales'),
  returnController.create
);
router.get('/', authenticate, returnController.findAll);
router.get('/:id', authenticate, returnController.findOne);
router.patch(
  '/:id/approve',
  authenticate,
  authorize('admin', 'warehouse_manager'),
  returnController.approve
);
router.patch(
  '/:id/process',
  authenticate,
  authorize('admin', 'warehouse_manager'),
  returnController.process
);

export default router;

