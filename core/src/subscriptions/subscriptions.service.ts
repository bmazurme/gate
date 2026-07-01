import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { Plan } from './entities/plan.entity';
import { SubscriptionPlan } from './enums/subscription-plan.enum';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { PLAN_CATALOG, PLAN_RANK } from './constants/plan-catalog';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SubscriptionsService implements OnModuleInit {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly plansRepository: Repository<Plan>,
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    const existingCount = await this.plansRepository.count();
    if (existingCount > 0) {
      return;
    }

    const seedPlans = Object.values(PLAN_CATALOG).map((definition) =>
      this.plansRepository.create(definition),
    );
    await this.plansRepository.save(seedPlans);
  }

  async getPlanCatalog(): Promise<Plan[]> {
    const plans = await this.plansRepository.find();
    return plans.sort((a, b) => PLAN_RANK[a.plan] - PLAN_RANK[b.plan]);
  }

  async getPlan(plan: SubscriptionPlan): Promise<Plan> {
    const planDefinition = await this.plansRepository.findOneBy({ plan });
    if (!planDefinition) {
      throw new NotFoundException(`Plan ${plan} not found`);
    }
    return planDefinition;
  }

  async updatePlanPrice(plan: SubscriptionPlan, price: number): Promise<Plan> {
    const planDefinition = await this.getPlan(plan);
    planDefinition.price = price;
    return this.plansRepository.save(planDefinition);
  }

  async subscribe(
    userId: string,
    plan: SubscriptionPlan,
  ): Promise<Subscription> {
    await this.usersService.findById(userId);

    const activeSubscription = await this.findActiveForUser(userId);
    if (activeSubscription) {
      throw new ConflictException(
        'User already has an active subscription. Cancel it before subscribing to a new plan.',
      );
    }

    const planDefinition = await this.getPlan(plan);

    let subscription = this.subscriptionsRepository.create({
      userId,
      plan,
      price: planDefinition.price,
      currency: planDefinition.currency,
      status: SubscriptionStatus.PENDING,
    });
    subscription = await this.subscriptionsRepository.save(subscription);

    const { success } = await this.paymentsService.charge({
      subscriptionId: subscription.id,
      amount: planDefinition.price,
      currency: planDefinition.currency,
    });

    if (!success) {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.canceledAt = new Date();
      await this.subscriptionsRepository.save(subscription);
      throw new UnprocessableEntityException(
        'Payment failed, subscription was not activated',
      );
    }

    const now = new Date();
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.startDate = now;
    subscription.endDate = new Date(
      now.getTime() + planDefinition.durationDays * 24 * 60 * 60 * 1000,
    );

    return this.subscriptionsRepository.save(subscription);
  }

  async cancel(id: string, userId: string): Promise<Subscription> {
    const subscription = await this.findByIdForUser(id, userId);

    if (subscription.status === SubscriptionStatus.CANCELED) {
      throw new ConflictException('Subscription is already canceled');
    }

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();
    subscription.autoRenew = false;

    return this.subscriptionsRepository.save(subscription);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.findByIdForUser(id, userId);

    if (dto.price !== undefined) {
      subscription.price = dto.price;
    }

    return this.subscriptionsRepository.save(subscription);
  }

  async findById(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOneBy({ id });
    if (!subscription) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }
    return subscription;
  }

  async findByIdForUser(id: string, userId: string): Promise<Subscription> {
    const subscription = await this.findById(id);
    if (subscription.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this subscription',
      );
    }
    return subscription;
  }

  findActiveForUser(userId: string): Promise<Subscription | null> {
    return this.subscriptionsRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  findAllForUser(userId: string): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
