import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './entities/subscription.entity';
import { Plan } from './entities/plan.entity';
import { SubscriptionPlan } from './enums/subscription-plan.enum';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let repository: {
    findOneBy: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let plansRepository: {
    findOneBy: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let paymentsService: { charge: jest.Mock };
  let usersService: { findById: jest.Mock };

  const basicPlan = {
    plan: SubscriptionPlan.BASIC,
    name: 'Basic',
    price: 9.99,
    currency: 'USD',
    durationDays: 30,
    features: [],
  };

  beforeEach(async () => {
    repository = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((data: Record<string, unknown>) => data),
      save: jest.fn((data: Record<string, unknown>) =>
        Promise.resolve({ id: 'sub-1', ...data }),
      ),
    };
    plansRepository = {
      findOneBy: jest.fn().mockResolvedValue(basicPlan),
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn((data: Record<string, unknown>) => data),
      save: jest.fn((data) => Promise.resolve(data)),
    };
    paymentsService = { charge: jest.fn() };
    usersService = { findById: jest.fn().mockResolvedValue({ id: 'user-1' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: getRepositoryToken(Subscription), useValue: repository },
        { provide: getRepositoryToken(Plan), useValue: plansRepository },
        { provide: PaymentsService, useValue: paymentsService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get(SubscriptionsService);
  });

  describe('onModuleInit', () => {
    it('seeds the plan catalog when the plans table is empty', async () => {
      plansRepository.count.mockResolvedValue(0);

      await service.onModuleInit();

      expect(plansRepository.create).toHaveBeenCalledTimes(3);
      expect(plansRepository.save).toHaveBeenCalled();
    });

    it('does not reseed when plans already exist', async () => {
      plansRepository.count.mockResolvedValue(3);

      await service.onModuleInit();

      expect(plansRepository.create).not.toHaveBeenCalled();
      expect(plansRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getPlanCatalog', () => {
    it('returns plans ordered from basic to max', async () => {
      plansRepository.find.mockResolvedValue([
        { ...basicPlan, plan: SubscriptionPlan.MAX },
        { ...basicPlan, plan: SubscriptionPlan.BASIC },
        { ...basicPlan, plan: SubscriptionPlan.EXTENDED },
      ]);

      const result = await service.getPlanCatalog();

      expect(result.map((plan) => plan.plan)).toEqual([
        SubscriptionPlan.BASIC,
        SubscriptionPlan.EXTENDED,
        SubscriptionPlan.MAX,
      ]);
    });
  });

  describe('updatePlanPrice', () => {
    it('updates the price of an existing plan', async () => {
      plansRepository.findOneBy.mockResolvedValue({ ...basicPlan });

      const result = await service.updatePlanPrice(
        SubscriptionPlan.BASIC,
        14.99,
      );

      expect(result.price).toBe(14.99);
      expect(plansRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ price: 14.99 }),
      );
    });

    it('throws NotFoundException for an unknown plan', async () => {
      plansRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updatePlanPrice(SubscriptionPlan.BASIC, 14.99),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('subscribe', () => {
    it('activates the subscription when the payment succeeds', async () => {
      repository.findOne.mockResolvedValue(null);
      paymentsService.charge.mockResolvedValue({ success: true, payment: {} });

      const result = await service.subscribe('user-1', SubscriptionPlan.BASIC);

      expect(result.status).toBe(SubscriptionStatus.ACTIVE);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(paymentsService.charge).toHaveBeenCalledWith({
        subscriptionId: 'sub-1',
        amount: 9.99,
        currency: 'USD',
      });
    });

    it('cancels the pending subscription and throws when the payment fails', async () => {
      repository.findOne.mockResolvedValue(null);
      paymentsService.charge.mockResolvedValue({ success: false, payment: {} });

      await expect(
        service.subscribe('user-1', SubscriptionPlan.BASIC),
      ).rejects.toThrow(UnprocessableEntityException);

      const calls = repository.save.mock.calls as Array<
        [Record<string, unknown>]
      >;
      const [lastSavedSubscription] = calls[calls.length - 1];
      expect(lastSavedSubscription.status).toBe(SubscriptionStatus.CANCELED);
    });

    it('throws ConflictException when the user already has an active subscription', async () => {
      repository.findOne.mockResolvedValue({
        id: 'existing',
        status: SubscriptionStatus.ACTIVE,
      });

      await expect(
        service.subscribe('user-1', SubscriptionPlan.BASIC),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('marks an owned subscription as canceled', async () => {
      repository.findOneBy.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        status: SubscriptionStatus.ACTIVE,
      });

      const result = await service.cancel('sub-1', 'user-1');

      expect(result.status).toBe(SubscriptionStatus.CANCELED);
      expect(result.canceledAt).toBeInstanceOf(Date);
      expect(result.autoRenew).toBe(false);
    });

    it('throws ForbiddenException when the subscription belongs to another user', async () => {
      repository.findOneBy.mockResolvedValue({
        id: 'sub-1',
        userId: 'someone-else',
        status: SubscriptionStatus.ACTIVE,
      });

      await expect(service.cancel('sub-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ConflictException when already canceled', async () => {
      repository.findOneBy.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        status: SubscriptionStatus.CANCELED,
      });

      await expect(service.cancel('sub-1', 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws NotFoundException when the subscription does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.cancel('missing', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates the price of an owned subscription', async () => {
      repository.findOneBy.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        price: 9.99,
      });

      const result = await service.update('sub-1', 'user-1', { price: 19.99 });

      expect(result.price).toBe(19.99);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ price: 19.99 }),
      );
    });

    it('leaves the price untouched when not provided', async () => {
      repository.findOneBy.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        price: 9.99,
      });

      const result = await service.update('sub-1', 'user-1', {});

      expect(result.price).toBe(9.99);
    });

    it('throws ForbiddenException when the subscription belongs to another user', async () => {
      repository.findOneBy.mockResolvedValue({
        id: 'sub-1',
        userId: 'someone-else',
        price: 9.99,
      });

      await expect(
        service.update('sub-1', 'user-1', { price: 19.99 }),
      ).rejects.toThrow(ForbiddenException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the subscription does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('missing', 'user-1', { price: 19.99 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIdForUser', () => {
    it('throws ForbiddenException for a non-owner', async () => {
      repository.findOneBy.mockResolvedValue({
        id: 'sub-1',
        userId: 'someone-else',
      });

      await expect(service.findByIdForUser('sub-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('returns the subscription for its owner', async () => {
      const subscription = { id: 'sub-1', userId: 'user-1' };
      repository.findOneBy.mockResolvedValue(subscription);

      await expect(service.findByIdForUser('sub-1', 'user-1')).resolves.toBe(
        subscription,
      );
    });
  });
});
