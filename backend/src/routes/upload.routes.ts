import { Router } from 'express';
import { UploadController, uploadMiddleware } from '../controllers/upload.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const uploadController = new UploadController();

router.post(
  '/products',
  authenticate,
  authorize('admin', 'procurement'),
  uploadMiddleware,
  uploadController.uploadProducts
);

export default router;

