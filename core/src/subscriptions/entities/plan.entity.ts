import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';

const decimalTransformer = {
  to: (value?: number) => value,
  from: (value?: string) =>
    value === null || value === undefined ? value : parseFloat(value),
};

@Entity('plans')
export class Plan {
  @PrimaryColumn({ type: 'enum', enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @Column()
  name: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'duration_days' })
  durationDays: number;

  @Column({ type: 'text', array: true })
  features: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
