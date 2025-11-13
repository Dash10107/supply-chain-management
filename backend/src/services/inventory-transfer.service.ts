import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Inventory } from '../schemas/Inventory';
import { AppError } from '../middlewares/error-handler';

export class InventoryTransferService {
  private inventoryRepository: Repository<Inventory>;

  constructor() {
    this.inventoryRepository = AppDataSource.getRepository(Inventory);
  }

  async transferInventory(
    productId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    quantity: number,
    userId?: string
  ): Promise<void> {
    if (fromWarehouseId === toWarehouseId) {
      throw new AppError('Source and destination warehouses cannot be the same', 400);
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get source inventory
      const sourceInventory = await this.inventoryRepository.findOne({
        where: { productId, warehouseId: fromWarehouseId },
      });

      if (!sourceInventory) {
        throw new AppError('Product not found in source warehouse', 404);
      }

      if (sourceInventory.availableQuantity < quantity) {
        throw new AppError('Insufficient inventory in source warehouse', 400);
      }

      // Decrement source
      sourceInventory.quantity -= quantity;
      await queryRunner.manager.save(sourceInventory);

      // Get or create destination inventory
      let destInventory = await this.inventoryRepository.findOne({
        where: { productId, warehouseId: toWarehouseId },
      });

      if (!destInventory) {
        const { Product } = await import('../schemas/Product');
        const { Warehouse } = await import('../schemas/Warehouse');
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: productId },
        });
        const warehouse = await queryRunner.manager.findOne(Warehouse, {
          where: { id: toWarehouseId },
        });

        if (!product || !warehouse) {
          throw new AppError('Product or warehouse not found', 404);
        }

        destInventory = this.inventoryRepository.create({
          productId,
          warehouseId: toWarehouseId,
          quantity: 0,
          reservedQuantity: 0,
        });
      }

      // Increment destination
      destInventory.quantity += quantity;
      await queryRunner.manager.save(destInventory);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

