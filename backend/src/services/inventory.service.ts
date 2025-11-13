import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Inventory } from '../schemas/Inventory';
import { Product } from '../schemas/Product';
import { Warehouse } from '../schemas/Warehouse';
import { AppError } from '../middlewares/error-handler';

export class InventoryService {
  private inventoryRepository: Repository<Inventory>;
  private productRepository: Repository<Product>;
  private warehouseRepository: Repository<Warehouse>;

  constructor() {
    this.inventoryRepository = AppDataSource.getRepository(Inventory);
    this.productRepository = AppDataSource.getRepository(Product);
    this.warehouseRepository = AppDataSource.getRepository(Warehouse);
  }

  async findAll(
    warehouseId?: string,
    productId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ inventories: Inventory[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (productId) {
      where.productId = productId;
    }

    const [inventories, total] = await this.inventoryRepository.findAndCount({
      where,
      relations: ['product', 'warehouse'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { inventories, total, page, limit };
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['product', 'warehouse'],
    });

    if (!inventory) {
      throw new AppError('Inventory not found', 404);
    }

    return inventory;
  }

  async findByProductAndWarehouse(
    productId: string,
    warehouseId: string
  ): Promise<Inventory | null> {
    return await this.inventoryRepository.findOne({
      where: { productId, warehouseId },
      relations: ['product', 'warehouse'],
    });
  }

  async allocateInventory(
    productId: string,
    quantity: number,
    preferredWarehouseId?: string
  ): Promise<{ inventory: Inventory; warehouseId: string }> {
    // Find all inventories for this product
    const inventories = await this.inventoryRepository.find({
      where: { productId },
      relations: ['warehouse', 'product'],
      order: { quantity: 'DESC' },
    });

    if (inventories.length === 0) {
      throw new AppError('Product not found in any warehouse', 404);
    }

    // If preferred warehouse is specified and has stock, use it
    if (preferredWarehouseId) {
      const preferred = inventories.find(
        (inv) => inv.warehouseId === preferredWarehouseId
      );
      if (preferred && preferred.availableQuantity >= quantity) {
        preferred.reservedQuantity += quantity;
        await this.inventoryRepository.save(preferred);
        return { inventory: preferred, warehouseId: preferredWarehouseId };
      }
    }

    // Sort by: nearest warehouse (if coordinates available), then by available quantity
    // For simplicity, we'll prioritize by available quantity and expiry date
    const sortedInventories = inventories
      .filter((inv) => inv.availableQuantity > 0)
      .sort((a, b) => {
        // If product has expiry, prefer earliest expiry
        if (a.product.hasExpiry && a.expiryDate && b.expiryDate) {
          // Convert to Date if it's a string
          const dateA = a.expiryDate instanceof Date ? a.expiryDate : new Date(a.expiryDate);
          const dateB = b.expiryDate instanceof Date ? b.expiryDate : new Date(b.expiryDate);
          
          // Check if dates are valid
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            // If dates are invalid, fall back to quantity sorting
            return b.availableQuantity - a.availableQuantity;
          }
          
          return dateA.getTime() - dateB.getTime();
        }
        // Otherwise, prefer highest available quantity
        return b.availableQuantity - a.availableQuantity;
      });

    if (sortedInventories.length === 0) {
      throw new AppError('Insufficient inventory', 400);
    }

    // Try to allocate from single warehouse
    for (const inventory of sortedInventories) {
      if (inventory.availableQuantity >= quantity) {
        inventory.reservedQuantity += quantity;
        await this.inventoryRepository.save(inventory);
        return { inventory, warehouseId: inventory.warehouseId };
      }
    }

    // If single warehouse doesn't have enough, allocate from multiple
    let remaining = quantity;
    const allocations: { inventory: Inventory; quantity: number }[] = [];

    for (const inventory of sortedInventories) {
      if (remaining <= 0) break;

      const allocateQty = Math.min(remaining, inventory.availableQuantity);
      inventory.reservedQuantity += allocateQty;
      allocations.push({ inventory, quantity: allocateQty });
      remaining -= allocateQty;
    }

    if (remaining > 0) {
      throw new AppError('Insufficient inventory across all warehouses', 400);
    }

    // Save all allocations
    for (const { inventory } of allocations) {
      await this.inventoryRepository.save(inventory);
    }

    // Return the primary allocation (first one)
    return {
      inventory: allocations[0].inventory,
      warehouseId: allocations[0].inventory.warehouseId,
    };
  }

  async incrementInventory(
    productId: string,
    warehouseId: string,
    quantity: number,
    batchNumber?: string,
    expiryDate?: Date
  ): Promise<Inventory> {
    let inventory = await this.findByProductAndWarehouse(productId, warehouseId);

    if (!inventory) {
      // Create new inventory record
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      const warehouse = await this.warehouseRepository.findOne({
        where: { id: warehouseId },
      });

      if (!product || !warehouse) {
        throw new AppError('Product or warehouse not found', 404);
      }

      inventory = this.inventoryRepository.create({
        productId,
        warehouseId,
        quantity: 0,
        reservedQuantity: 0,
        batchNumber,
        expiryDate,
      });
    }

    inventory.quantity += quantity;
    if (batchNumber) inventory.batchNumber = batchNumber;
    if (expiryDate) inventory.expiryDate = expiryDate;

    return await this.inventoryRepository.save(inventory);
  }

  async decrementInventory(
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<Inventory> {
    const inventory = await this.findByProductAndWarehouse(productId, warehouseId);

    if (!inventory) {
      throw new AppError('Inventory not found', 404);
    }

    if (inventory.quantity < quantity) {
      throw new AppError('Insufficient inventory', 400);
    }

    inventory.quantity -= quantity;
    inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);

    return await this.inventoryRepository.save(inventory);
  }

  async releaseReservation(
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<Inventory> {
    const inventory = await this.findByProductAndWarehouse(productId, warehouseId);

    if (!inventory) {
      throw new AppError('Inventory not found', 404);
    }

    inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);

    return await this.inventoryRepository.save(inventory);
  }
}

