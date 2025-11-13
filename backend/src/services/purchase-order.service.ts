import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { PurchaseOrder, PurchaseOrderStatus } from '../schemas/PurchaseOrder';
import { InventoryService } from './inventory.service';
import { ReceivePurchaseOrderDto } from '../dto/order.dto';
import { AppError } from '../middlewares/error-handler';

export class PurchaseOrderService {
  private purchaseOrderRepository: Repository<PurchaseOrder>;
  private inventoryService: InventoryService;

  constructor() {
    this.purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);
    this.inventoryService = new InventoryService();
  }

  async receivePurchaseOrder(
    id: string,
    receiveDto: ReceivePurchaseOrderDto
  ): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new AppError('Purchase order not found', 404);
    }

    if (order.status === PurchaseOrderStatus.RECEIVED) {
      throw new AppError('Purchase order already received', 400);
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Process each received item
      for (const receiveItem of receiveDto.items) {
        const orderItem = order.items.find((item) => item.id === receiveItem.itemId);

        if (!orderItem) {
          throw new AppError(`Order item ${receiveItem.itemId} not found`, 404);
        }

        const receivedQty = receiveItem.receivedQuantity;
        const remainingQty = orderItem.quantity - orderItem.receivedQuantity;

        if (receivedQty > remainingQty) {
          throw new AppError(
            `Cannot receive more than remaining quantity for item ${orderItem.id}`,
            400
          );
        }

        // Increment inventory
        await this.inventoryService.incrementInventory(
          orderItem.productId,
          receiveDto.warehouseId,
          receivedQty,
          receiveItem.batchNumber,
          receiveItem.expiryDate ? new Date(receiveItem.expiryDate) : undefined
        );

        // Update received quantity
        orderItem.receivedQuantity += receivedQty;
        await queryRunner.manager.save(orderItem);
      }

      // Update order status
      const allReceived = order.items.every(
        (item) => item.receivedQuantity >= item.quantity
      );

      if (allReceived) {
        order.status = PurchaseOrderStatus.RECEIVED;
        order.receivedDate = receiveDto.receivedDate
          ? new Date(receiveDto.receivedDate)
          : new Date();
      } else {
        order.status = PurchaseOrderStatus.PARTIALLY_RECEIVED;
      }

      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return await this.purchaseOrderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['supplier', 'items', 'items.product'],
      }) as PurchaseOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async autoGeneratePurchaseOrders(): Promise<PurchaseOrder[]> {
    // This would check for products below reorder threshold
    // For now, return empty array - can be implemented with a scheduled job
    return [];
  }
}

