import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SalesOrder } from './SalesOrder';
import { Warehouse } from './Warehouse';

export enum ShipmentStatus {
  PENDING = 'pending',
  PICKED = 'picked',
  PACKED = 'packed',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  trackingNumber!: string;

  @Column({ name: 'sales_order_id' })
  salesOrderId!: string;

  @ManyToOne(() => SalesOrder, { eager: true })
  @JoinColumn({ name: 'sales_order_id' })
  salesOrder!: SalesOrder;

  @Column({ name: 'origin_warehouse_id' })
  originWarehouseId!: string;

  @ManyToOne(() => Warehouse, { eager: true })
  @JoinColumn({ name: 'origin_warehouse_id' })
  originWarehouse!: Warehouse;

  @Column({ name: 'destination_warehouse_id', nullable: true })
  destinationWarehouseId?: string;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'destination_warehouse_id' })
  destinationWarehouse?: Warehouse;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status!: ShipmentStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  carrier?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  carrierTrackingNumber?: string;

  @Column({ type: 'date', nullable: true })
  shippedDate?: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate?: Date;

  @Column({ type: 'date', nullable: true })
  deliveredDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

