import { SubscriptionPlan } from '../enums/subscription-plan.enum';

export interface PlanDefinition {
  plan: SubscriptionPlan;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
}

export const PLAN_CATALOG: Record<SubscriptionPlan, PlanDefinition> = {
  [SubscriptionPlan.BASIC]: {
    plan: SubscriptionPlan.BASIC,
    name: 'Basic',
    price: 9.99,
    currency: 'USD',
    durationDays: 30,
    features: ['Базовый доступ к сервису', 'Поддержка по email'],
  },
  [SubscriptionPlan.EXTENDED]: {
    plan: SubscriptionPlan.EXTENDED,
    name: 'Extended',
    price: 19.99,
    currency: 'USD',
    durationDays: 30,
    features: [
      'Расширенный доступ',
      'Приоритетная поддержка',
      'Увеличенные лимиты',
    ],
  },
  [SubscriptionPlan.MAX]: {
    plan: SubscriptionPlan.MAX,
    name: 'Max',
    price: 39.99,
    currency: 'USD',
    durationDays: 30,
    features: ['Полный доступ', 'Поддержка 24/7', 'Максимальные лимиты'],
  },
};

export const PLAN_RANK: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.BASIC]: 1,
  [SubscriptionPlan.EXTENDED]: 2,
  [SubscriptionPlan.MAX]: 3,
};
