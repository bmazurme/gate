import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SubscriptionsService } from '../subscriptions.service';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { PLAN_RANK } from '../constants/plan-catalog';
import { REQUIRE_PLAN_KEY } from '../decorators/require-plan.decorator';

interface RequestWithSubscriptionContext extends Request {
  user?: { id: string };
  subscription?: Subscription;
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.getAllAndOverride<
      SubscriptionPlan | undefined
    >(REQUIRE_PLAN_KEY, [context.getHandler(), context.getClass()]);

    const request = context
      .switchToHttp()
      .getRequest<RequestWithSubscriptionContext>();
    const userId = this.extractUserId(request);

    if (!userId) {
      throw new ForbiddenException(
        'User identity is required to check subscription access',
      );
    }

    const subscription =
      await this.subscriptionsService.findActiveForUser(userId);

    if (!subscription) {
      throw new ForbiddenException(
        'An active subscription is required to access this resource',
      );
    }

    if (
      requiredPlan &&
      PLAN_RANK[subscription.plan] < PLAN_RANK[requiredPlan]
    ) {
      throw new ForbiddenException(
        `This resource requires the "${requiredPlan}" plan or higher`,
      );
    }

    request.subscription = subscription;
    return true;
  }

  // req.user заполняется JwtAuthGuard — этот гвард должен идти после него в @UseGuards().
  // Фоллбэк на params/body/query/x-user-id остаётся для маршрутов без JwtAuthGuard.
  private extractUserId(
    request: RequestWithSubscriptionContext,
  ): string | undefined {
    const params = request.params as Record<string, string | undefined>;
    const body = request.body as Record<string, string | undefined>;
    const query = request.query as Record<string, string | undefined>;

    return (
      request.user?.id ??
      params?.userId ??
      body?.userId ??
      query?.userId ??
      (request.headers['x-user-id'] as string | undefined)
    );
  }
}
