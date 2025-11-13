import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { SalesOrder } from '../schemas/SalesOrder';
import { PurchaseOrder } from '../schemas/PurchaseOrder';
import { Inventory } from '../schemas/Inventory';
import { Product } from '../schemas/Product';
import { SalesOrderStatus } from '../schemas/SalesOrder';

export class AnalyticsService {
  private salesOrderRepository: Repository<SalesOrder>;
  private purchaseOrderRepository: Repository<PurchaseOrder>;
  private inventoryRepository: Repository<Inventory>;
  private productRepository: Repository<Product>;

  constructor() {
    this.salesOrderRepository = AppDataSource.getRepository(SalesOrder);
    this.purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);
    this.inventoryRepository = AppDataSource.getRepository(Inventory);
    this.productRepository = AppDataSource.getRepository(Product);
  }

  async getDashboardStats() {
    const [
      totalProducts,
      totalSalesOrders,
      totalPurchaseOrders,
      totalInventoryValue,
    ] = await Promise.all([
      this.productRepository.count(),
      this.salesOrderRepository.count(),
      this.purchaseOrderRepository.count(),
      this.getTotalInventoryValue(),
    ]);

    const recentSales = await this.salesOrderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.createdAt >= :date', {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })
      .getRawOne();

    const pendingOrders = await this.salesOrderRepository.count({
      where: { status: SalesOrderStatus.PENDING },
    });

    return {
      totalProducts,
      totalSalesOrders,
      totalPurchaseOrders,
      totalInventoryValue,
      monthlySales: parseFloat(recentSales?.total || '0'),
      pendingOrders,
    };
  }

  async getTotalInventoryValue(): Promise<number> {
    const result = await this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .select('SUM(inv.quantity * product.cost)', 'total')
      .where('product.cost IS NOT NULL')
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  async getSalesByPeriod(startDate: Date, endDate: Date) {
    return await this.salesOrderRepository
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('SUM(order.totalAmount)', 'total')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.createdAt <= :endDate', { endDate })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async getTopProducts(limit: number = 10) {
    return await this.salesOrderRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.totalPrice)', 'totalRevenue')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getLowStockProducts() {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.inventories', 'inventory')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('product.sku', 'sku')
      .addSelect('product.reorderThreshold', 'reorderThreshold')
      .addSelect('SUM(inventory.quantity)', 'totalStock')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.sku')
      .addGroupBy('product.reorderThreshold')
      .having('SUM(inventory.quantity) <= product.reorderThreshold')
      .getRawMany();
  }
}

