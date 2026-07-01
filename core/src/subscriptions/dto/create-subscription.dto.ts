import { IsEnum } from 'class-validator';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}
