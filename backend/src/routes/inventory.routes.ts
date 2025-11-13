import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const inventoryController = new InventoryController();

router.get('/', authenticate, inventoryController.findAll);
router.get('/:id', authenticate, inventoryController.findOne);

export default router;

