import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SalesOrderItem } from './SalesOrderItem';
import { Shipment } from './Shipment';
import { Return } from './Return';

export enum SalesOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

@Entity('sales_orders')
export class SalesOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  orderNumber!: string;

  @Column({ nullable: true })
  customerName?: string;

  @Column({ nullable: true })
  customerEmail?: string;

  @Column({ nullable: true })
  customerPhone?: string;

  @Column({ type: 'text', nullable: true })
  shippingAddress?: string;

  @Column({
    type: 'enum',
    enum: SalesOrderStatus,
    default: SalesOrderStatus.PENDING,
  })
  status!: SalesOrderStatus;

  @Column({ type: 'date' })
  orderDate!: Date;

  @Column({ type: 'date', nullable: true })
  shippedDate?: Date;

  @Column({ type: 'date', nullable: true })
  deliveredDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @OneToMany(() => SalesOrderItem, (item) => item.salesOrder, {
    cascade: true,
  })
  items!: SalesOrderItem[];

  @OneToMany(() => Shipment, (shipment) => shipment.salesOrder)
  shipments!: Shipment[];

  @OneToMany(() => Return, (returnOrder) => returnOrder.salesOrder)
  returns!: Return[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

