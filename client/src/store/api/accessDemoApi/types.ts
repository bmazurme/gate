import type { SubscriptionPlan } from '../subscriptionsApi/types';
import type { Role } from '../authApi/types';

export interface AccessDemoResponse {
  plan: SubscriptionPlan;
  message: string;
}

export interface AccessDemoRoleResponse {
  role: Role;
  message: string;
}
