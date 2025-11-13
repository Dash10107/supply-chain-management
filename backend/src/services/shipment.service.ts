import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Shipment, ShipmentStatus } from '../schemas/Shipment';
import { SalesOrder, SalesOrderStatus } from '../schemas/SalesOrder';
import { InventoryService } from './inventory.service';
import { AppError } from '../middlewares/error-handler';

export class ShipmentService {
  private shipmentRepository: Repository<Shipment>;
  private salesOrderRepository: Repository<SalesOrder>;
  private inventoryService: InventoryService;

  constructor() {
    this.shipmentRepository = AppDataSource.getRepository(Shipment);
    this.salesOrderRepository = AppDataSource.getRepository(SalesOrder);
    this.inventoryService = new InventoryService();
  }

  async createShipment(salesOrderId: string): Promise<Shipment> {
    const order = await this.salesOrderRepository.findOne({
      where: { id: salesOrderId },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new AppError('Sales order not found', 404);
    }

    if (order.status !== SalesOrderStatus.CONFIRMED) {
      throw new AppError('Order must be confirmed before creating shipment', 400);
    }

    // Get the primary warehouse from order items
    const warehouseId = order.items[0]?.allocatedWarehouseId;
    if (!warehouseId) {
      throw new AppError('No warehouse allocated for order items', 400);
    }

    const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const shipment = this.shipmentRepository.create({
      trackingNumber,
      salesOrderId: order.id,
      originWarehouseId: warehouseId,
      status: ShipmentStatus.PENDING,
    });

    return await this.shipmentRepository.save(shipment);
  }

  async updateShipmentStatus(
    id: string,
    status: ShipmentStatus,
    carrier?: string,
    carrierTrackingNumber?: string
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['salesOrder', 'salesOrder.items', 'originWarehouse'],
    });

    if (!shipment) {
      throw new AppError('Shipment not found', 404);
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      shipment.status = status;

      if (status === ShipmentStatus.PICKED) {
        // Decrement inventory when items are picked
        for (const item of shipment.salesOrder.items) {
          if (item.allocatedWarehouseId === shipment.originWarehouseId) {
            await this.inventoryService.decrementInventory(
              item.productId,
              item.allocatedWarehouseId,
              item.quantity
            );
          }
        }
      } else if (status === ShipmentStatus.IN_TRANSIT) {
        shipment.shippedDate = new Date();
      } else if (status === ShipmentStatus.DELIVERED) {
        shipment.deliveredDate = new Date();
        shipment.salesOrder.status = SalesOrderStatus.DELIVERED;
        shipment.salesOrder.deliveredDate = new Date();
        await queryRunner.manager.save(shipment.salesOrder);
      }

      if (carrier) shipment.carrier = carrier;
      if (carrierTrackingNumber) shipment.carrierTrackingNumber = carrierTrackingNumber;

      const savedShipment = await queryRunner.manager.save(shipment);

      await queryRunner.commitTransaction();

      return await this.shipmentRepository.findOne({
        where: { id: savedShipment.id },
        relations: ['salesOrder', 'originWarehouse'],
      }) as Shipment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: ShipmentStatus
  ): Promise<{ shipments: Shipment[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [shipments, total] = await this.shipmentRepository.findAndCount({
      where,
      relations: ['salesOrder', 'originWarehouse', 'destinationWarehouse'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { shipments, total, page, limit };
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['salesOrder', 'salesOrder.items', 'originWarehouse', 'destinationWarehouse'],
    });

    if (!shipment) {
      throw new AppError('Shipment not found', 404);
    }

    return shipment;
  }
}

