import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { SubscriptionGuard } from './subscription.guard';
import { SubscriptionsService } from '../subscriptions.service';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

describe('SubscriptionGuard', () => {
  let guard: SubscriptionGuard;
  let subscriptionsService: { findActiveForUser: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };

  const buildContext = (request: Record<string, unknown>): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  const emptyRequest = () => ({ params: {}, body: {}, query: {}, headers: {} });

  beforeEach(() => {
    subscriptionsService = { findActiveForUser: jest.fn() };
    reflector = { getAllAndOverride: jest.fn() };
    guard = new SubscriptionGuard(
      subscriptionsService as unknown as SubscriptionsService,
      reflector as unknown as Reflector,
    );
  });

  it('throws ForbiddenException when no user identity is present', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = buildContext(emptyRequest());

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when there is no active subscription', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    subscriptionsService.findActiveForUser.mockResolvedValue(null);
    const context = buildContext({ ...emptyRequest(), user: { id: 'user-1' } });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when the plan tier is insufficient', async () => {
    reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.MAX);
    subscriptionsService.findActiveForUser.mockResolvedValue({
      plan: SubscriptionPlan.BASIC,
      status: SubscriptionStatus.ACTIVE,
    });
    const context = buildContext({ ...emptyRequest(), user: { id: 'user-1' } });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows access and attaches the subscription to the request when the tier is sufficient', async () => {
    reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.BASIC);
    const subscription = {
      plan: SubscriptionPlan.MAX,
      status: SubscriptionStatus.ACTIVE,
    };
    subscriptionsService.findActiveForUser.mockResolvedValue(subscription);
    const request = { ...emptyRequest(), user: { id: 'user-1' } } as Record<
      string,
      unknown
    >;
    const context = buildContext(request);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.subscription).toBe(subscription);
  });

  it('falls back to the x-user-id header when req.user is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    subscriptionsService.findActiveForUser.mockResolvedValue({
      plan: SubscriptionPlan.BASIC,
      status: SubscriptionStatus.ACTIVE,
    });
    const context = buildContext({
      params: {},
      body: {},
      query: {},
      headers: { 'x-user-id': 'header-user' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(subscriptionsService.findActiveForUser).toHaveBeenCalledWith(
      'header-user',
    );
  });
});
