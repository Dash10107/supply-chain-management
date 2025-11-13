import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import inventoryRoutes from './inventory.routes';
import orderRoutes from './order.routes';
import purchaseOrderRoutes from './purchase-order.routes';
import shipmentRoutes from './shipment.routes';
import returnRoutes from './return.routes';
import analyticsRoutes from './analytics.routes';
import supplierRoutes from './supplier.routes';
import warehouseRoutes from './warehouse.routes';
import uploadRoutes from './upload.routes';
import roleRoutes from './role.routes';
import userRoutes from './user.routes';
import inventoryTransferRoutes from './inventory-transfer.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales-orders', orderRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/returns', returnRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/upload', uploadRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/inventory-transfer', inventoryTransferRoutes);

export default router;

