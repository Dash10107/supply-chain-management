import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SalesOrder } from './SalesOrder';
import { ReturnItem } from './ReturnItem';

export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  RECEIVED = 'received',
  PROCESSED = 'processed',
  REJECTED = 'rejected',
}

export enum ReturnReason {
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  DAMAGED = 'damaged',
  CUSTOMER_REQUEST = 'customer_request',
  OTHER = 'other',
}

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  returnNumber!: string;

  @Column({ name: 'sales_order_id' })
  salesOrderId!: string;

  @ManyToOne(() => SalesOrder, { eager: true })
  @JoinColumn({ name: 'sales_order_id' })
  salesOrder!: SalesOrder;

  @Column({
    type: 'enum',
    enum: ReturnStatus,
    default: ReturnStatus.PENDING,
  })
  status!: ReturnStatus;

  @Column({
    type: 'enum',
    enum: ReturnReason,
  })
  reason!: ReturnReason;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date' })
  returnDate!: Date;

  @Column({ type: 'date', nullable: true })
  receivedDate?: Date;

  @Column({ type: 'date', nullable: true })
  processedDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'processed_by', nullable: true })
  processedBy?: string;

  @OneToMany(() => ReturnItem, (item) => item.return, { cascade: true })
  items!: ReturnItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

