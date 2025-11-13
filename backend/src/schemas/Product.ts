import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Inventory } from './Inventory';
import { SalesOrderItem } from './SalesOrderItem';
import { PurchaseOrderItem } from './PurchaseOrderItem';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  sku!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  brand?: string;

  @Column({ type: 'int', default: 0 })
  reorderThreshold!: number;

  @Column({ type: 'int', default: 0 })
  reorderQuantity!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  hasExpiry!: boolean;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventories!: Inventory[];

  @OneToMany(() => SalesOrderItem, (orderItem) => orderItem.product)
  salesOrderItems!: SalesOrderItem[];

  @OneToMany(() => PurchaseOrderItem, (orderItem) => orderItem.product)
  purchaseOrderItems!: PurchaseOrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

