import { Repository, DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import {
  SalesOrder,
  SalesOrderStatus,
} from '../schemas/SalesOrder';
import { SalesOrderItem } from '../schemas/SalesOrderItem';
import { PurchaseOrder, PurchaseOrderStatus } from '../schemas/PurchaseOrder';
import { InventoryService } from './inventory.service';
import { CreateSalesOrderDto, CreatePurchaseOrderDto } from '../dto/order.dto';
import { AppError } from '../middlewares/error-handler';

export class OrderService {
  private salesOrderRepository: Repository<SalesOrder>;
  private purchaseOrderRepository: Repository<PurchaseOrder>;
  private inventoryService: InventoryService;

  constructor() {
    this.salesOrderRepository = AppDataSource.getRepository(SalesOrder);
    this.purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);
    this.inventoryService = new InventoryService();
  }

  async createSalesOrder(
    createOrderDto: CreateSalesOrderDto,
    userId?: string
  ): Promise<SalesOrder> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate order number
      const orderNumber = `SO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const order = this.salesOrderRepository.create({
        orderNumber,
        customerName: createOrderDto.customerName,
        customerEmail: createOrderDto.customerEmail,
        customerPhone: createOrderDto.customerPhone,
        shippingAddress: createOrderDto.shippingAddress,
        orderDate: new Date(),
        status: SalesOrderStatus.PENDING,
        createdBy: userId,
        notes: createOrderDto.notes,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // Create order items and allocate inventory
      const items: SalesOrderItem[] = [];
      let totalAmount = 0;
      const salesOrderItemRepository = queryRunner.manager.getRepository(SalesOrderItem);

      for (const itemDto of createOrderDto.items) {
        // Allocate inventory
        const allocation = await this.inventoryService.allocateInventory(
          itemDto.productId,
          itemDto.quantity
        );

        const item = salesOrderItemRepository.create({
          salesOrderId: savedOrder.id,
          productId: itemDto.productId,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          totalPrice: itemDto.quantity * itemDto.unitPrice,
          allocatedWarehouseId: allocation.warehouseId,
        });

        const savedItem = await salesOrderItemRepository.save(item);
        items.push(savedItem);
        totalAmount += savedItem.totalPrice;
      }

      savedOrder.items = items;
      savedOrder.totalAmount = totalAmount;
      savedOrder.status = SalesOrderStatus.CONFIRMED;

      const finalOrder = await queryRunner.manager.save(savedOrder);

      await queryRunner.commitTransaction();
      return await this.salesOrderRepository.findOne({
        where: { id: finalOrder.id },
        relations: ['items', 'items.product'],
      }) as SalesOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllSalesOrders(
    page: number = 1,
    limit: number = 10,
    status?: SalesOrderStatus
  ): Promise<{ orders: SalesOrder[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [orders, total] = await this.salesOrderRepository.findAndCount({
      where,
      relations: ['items', 'items.product'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { orders, total, page, limit };
  }

  async findSalesOrder(id: string): Promise<SalesOrder> {
    const order = await this.salesOrderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'shipments', 'returns'],
    });

    if (!order) {
      throw new AppError('Sales order not found', 404);
    }

    return order;
  }

  async cancelSalesOrder(id: string): Promise<SalesOrder> {
    const order = await this.findSalesOrder(id);

    if (order.status === SalesOrderStatus.CANCELLED) {
      throw new AppError('Order already cancelled', 400);
    }

    if ([SalesOrderStatus.SHIPPED, SalesOrderStatus.DELIVERED].includes(order.status)) {
      throw new AppError('Cannot cancel shipped or delivered order', 400);
    }

    // Release reserved inventory
    for (const item of order.items) {
      if (item.allocatedWarehouseId) {
        await this.inventoryService.releaseReservation(
          item.productId,
          item.allocatedWarehouseId,
          item.quantity
        );
      }
    }

    order.status = SalesOrderStatus.CANCELLED;
    return await this.salesOrderRepository.save(order);
  }

  async createPurchaseOrder(
    createOrderDto: CreatePurchaseOrderDto,
    userId?: string
  ): Promise<PurchaseOrder> {
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order = this.purchaseOrderRepository.create({
      poNumber,
      supplierId: createOrderDto.supplierId,
      status: PurchaseOrderStatus.PENDING,
      orderDate: new Date(),
      expectedDeliveryDate: createOrderDto.expectedDeliveryDate
        ? new Date(createOrderDto.expectedDeliveryDate)
        : undefined,
      createdBy: userId,
      notes: createOrderDto.notes,
    });

    const savedOrder = await this.purchaseOrderRepository.save(order);

    // Create order items
    const { PurchaseOrderItem } = await import('../schemas/PurchaseOrderItem');
    const itemRepository = AppDataSource.getRepository(PurchaseOrderItem);

    let totalAmount = 0;
    const items = [];

    for (const itemDto of createOrderDto.items) {
      const item = itemRepository.create({
        purchaseOrderId: savedOrder.id,
        productId: itemDto.productId,
        quantity: itemDto.quantity,
        unitPrice: itemDto.unitPrice,
        totalPrice: itemDto.quantity * itemDto.unitPrice,
      });

      const savedItem = await itemRepository.save(item);
      items.push(savedItem);
      totalAmount += savedItem.totalPrice;
    }

    savedOrder.items = items;
    savedOrder.totalAmount = totalAmount;

    return await this.purchaseOrderRepository.save(savedOrder);
  }

  async findAllPurchaseOrders(
    page: number = 1,
    limit: number = 10,
    status?: PurchaseOrderStatus
  ): Promise<{ orders: PurchaseOrder[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [orders, total] = await this.purchaseOrderRepository.findAndCount({
      where,
      relations: ['supplier', 'items', 'items.product'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { orders, total, page, limit };
  }

  async findPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['supplier', 'items', 'items.product'],
    });

    if (!order) {
      throw new AppError('Purchase order not found', 404);
    }

    return order;
  }
}

