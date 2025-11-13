import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

router.get('/', authenticate, authorize('admin'), userController.findAll);
router.get('/:id', authenticate, authorize('admin'), userController.findOne);
router.patch('/:id', authenticate, authorize('admin'), userController.update);
router.delete('/:id', authenticate, authorize('admin'), userController.delete);

export default router;

