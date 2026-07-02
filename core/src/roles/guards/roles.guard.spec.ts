import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../enums/role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const buildContext = (request: Record<string, unknown>): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = buildContext({ user: { roles: [Role.USER] } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when the user has one of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = buildContext({ user: { roles: [Role.USER, Role.ADMIN] } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException when the user lacks the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = buildContext({ user: { roles: [Role.USER] } });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when there is no user on the request', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = buildContext({});

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
