import { SetMetadata } from '@nestjs/common';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';

export const REQUIRE_PLAN_KEY = 'requirePlan';

// Только метаданные: не навешивает SubscriptionGuard сам, чтобы порядок гвардов
// (сначала JwtAuthGuard, затем SubscriptionGuard) был явным и не зависел от
// порядка декораторов — используйте вместе с @UseGuards(JwtAuthGuard, SubscriptionGuard).
export const RequirePlan = (plan: SubscriptionPlan) =>
  SetMetadata(REQUIRE_PLAN_KEY, plan);
