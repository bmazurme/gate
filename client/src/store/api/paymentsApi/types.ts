export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  externalId: string | null;
  failureReason: string | null;
  createdAt: string;
}
