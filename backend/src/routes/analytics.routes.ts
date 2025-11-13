import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.get('/dashboard', authenticate, analyticsController.getDashboardStats);
router.get('/sales', authenticate, analyticsController.getSalesByPeriod);
router.get('/top-products', authenticate, analyticsController.getTopProducts);
router.get('/low-stock', authenticate, analyticsController.getLowStockProducts);

export default router;

