import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Return, ReturnStatus, ReturnReason } from '../schemas/Return';
import { ReturnItem } from '../schemas/ReturnItem';
import { SalesOrder } from '../schemas/SalesOrder';
import { InventoryService } from './inventory.service';
import { AppError } from '../middlewares/error-handler';

export class ReturnService {
  private returnRepository: Repository<Return>;
  private returnItemRepository: Repository<ReturnItem>;
  private salesOrderRepository: Repository<SalesOrder>;
  private inventoryService: InventoryService;

  constructor() {
    this.returnRepository = AppDataSource.getRepository(Return);
    this.returnItemRepository = AppDataSource.getRepository(ReturnItem);
    this.salesOrderRepository = AppDataSource.getRepository(SalesOrder);
    this.inventoryService = new InventoryService();
  }

  async createReturn(
    salesOrderId: string,
    items: Array<{ productId: string; quantity: number }>,
    reason: ReturnReason,
    description?: string
  ): Promise<Return> {
    const order = await this.salesOrderRepository.findOne({
      where: { id: salesOrderId },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new AppError('Sales order not found', 404);
    }

    const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const returnOrder = this.returnRepository.create({
      returnNumber,
      salesOrderId: order.id,
      reason,
      description,
      returnDate: new Date(),
      status: ReturnStatus.PENDING,
      refundAmount: 0,
    });

    const savedReturn = await this.returnRepository.save(returnOrder);

    // Create return items
    let totalRefund = 0;
    const returnItems: ReturnItem[] = [];

    for (const item of items) {
      const orderItem = order.items.find((oi) => oi.productId === item.productId);

      if (!orderItem) {
        throw new AppError(`Product ${item.productId} not found in order`, 404);
      }

      if (item.quantity > orderItem.quantity) {
        throw new AppError(
          `Return quantity exceeds order quantity for product ${item.productId}`,
          400
        );
      }

      const refundAmount = item.quantity * orderItem.unitPrice;

      const returnItem = this.returnItemRepository.create({
        returnId: savedReturn.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: orderItem.unitPrice,
        refundAmount,
      });

      const savedItem = await this.returnItemRepository.save(returnItem);
      returnItems.push(savedItem);
      totalRefund += refundAmount;
    }

    savedReturn.items = returnItems;
    savedReturn.refundAmount = totalRefund;

    return await this.returnRepository.save(savedReturn);
  }

  async processReturn(id: string, warehouseId: string, userId?: string): Promise<Return> {
    const returnOrder = await this.returnRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'salesOrder'],
    });

    if (!returnOrder) {
      throw new AppError('Return not found', 404);
    }

    if (returnOrder.status !== ReturnStatus.APPROVED) {
      throw new AppError('Return must be approved before processing', 400);
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Restore inventory
      for (const item of returnOrder.items) {
        await this.inventoryService.incrementInventory(
          item.productId,
          warehouseId,
          item.quantity
        );
      }

      returnOrder.status = ReturnStatus.PROCESSED;
      returnOrder.processedDate = new Date();
      returnOrder.processedBy = userId;

      const savedReturn = await queryRunner.manager.save(returnOrder);

      await queryRunner.commitTransaction();

      return await this.returnRepository.findOne({
        where: { id: savedReturn.id },
        relations: ['items', 'items.product', 'salesOrder'],
      }) as Return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async approveReturn(id: string): Promise<Return> {
    const returnOrder = await this.returnRepository.findOne({ where: { id } });

    if (!returnOrder) {
      throw new AppError('Return not found', 404);
    }

    returnOrder.status = ReturnStatus.APPROVED;
    returnOrder.receivedDate = new Date();

    return await this.returnRepository.save(returnOrder);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: ReturnStatus
  ): Promise<{ returns: Return[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [returns, total] = await this.returnRepository.findAndCount({
      where,
      relations: ['salesOrder', 'items', 'items.product'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { returns, total, page, limit };
  }

  async findOne(id: string): Promise<Return> {
    const returnOrder = await this.returnRepository.findOne({
      where: { id },
      relations: ['salesOrder', 'items', 'items.product'],
    });

    if (!returnOrder) {
      throw new AppError('Return not found', 404);
    }

    return returnOrder;
  }
}

