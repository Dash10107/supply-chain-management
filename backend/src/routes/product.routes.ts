import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateDto } from '../middlewares/validator.middleware';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

const router = Router();
const productController = new ProductController();

router.get('/', authenticate, productController.findAll);
router.get('/:id', authenticate, productController.findOne);
router.post(
  '/',
  authenticate,
  authorize('admin', 'procurement'),
  validateDto(CreateProductDto),
  productController.create
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'procurement'),
  validateDto(UpdateProductDto),
  productController.update
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  productController.delete
);

export default router;

