export type SubscriptionPlan = 'basic' | 'extended' | 'max';
export type SubscriptionStatus = 'pending' | 'active' | 'canceled' | 'expired';

export interface PlanDefinition {
  plan: SubscriptionPlan;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  price: number;
  currency: string;
  autoRenew: boolean;
  startDate: string | null;
  endDate: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}
