import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../roles/enums/role.enum';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    findOneBy: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    findAndCount: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let queryBuilder: { where: jest.Mock; getCount: jest.Mock };

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    };
    repository = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((data: Record<string, unknown>) => data),
      save: jest.fn((data: Record<string, unknown>) =>
        Promise.resolve({ id: 'user-1', ...data }),
      ),
      update: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('create', () => {
    it('hashes the password and saves a new user as the first admin when none exists', async () => {
      repository.findOneBy.mockResolvedValue(null);
      queryBuilder.getCount.mockResolvedValue(0);
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);

      const result = await service.create({
        email: 'a@test.com',
        password: 'plain',
        name: 'A',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
      expect(repository.create).toHaveBeenCalledWith({
        email: 'a@test.com',
        password: 'hashed-password',
        name: 'A',
        roles: [Role.ADMIN],
      });
      expect(result).toMatchObject({
        id: 'user-1',
        password: 'hashed-password',
      });
    });

    it('saves a regular user when an admin already exists', async () => {
      repository.findOneBy.mockResolvedValue(null);
      queryBuilder.getCount.mockResolvedValue(1);
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);

      await service.create({ email: 'b@test.com', password: 'plain' });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ roles: [Role.USER] }),
      );
    });

    it('throws ConflictException if the email already exists', async () => {
      repository.findOneBy.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create({ email: 'a@test.com', password: 'plain' }),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateRoles', () => {
    it('updates the roles of another user', async () => {
      repository.findOneBy.mockResolvedValue({
        id: 'user-1',
        roles: [Role.USER],
      });

      const result = await service.updateRoles(
        'user-1',
        [Role.ADMIN],
        'admin-1',
      );

      expect(result.roles).toEqual([Role.ADMIN]);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ roles: [Role.ADMIN] }),
      );
    });

    it('throws ForbiddenException when changing your own roles', async () => {
      await expect(
        service.updateRoles('user-1', [Role.ADMIN], 'user-1'),
      ).rejects.toThrow(ForbiddenException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the user does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateRoles('missing', [Role.ADMIN], 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setBlocked', () => {
    it('blocks another user', async () => {
      repository.findOneBy.mockResolvedValue({
        id: 'user-1',
        isBlocked: false,
      });

      const result = await service.setBlocked('user-1', true, 'admin-1');

      expect(result.isBlocked).toBe(true);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isBlocked: true }),
      );
    });

    it('throws ForbiddenException when blocking yourself', async () => {
      await expect(
        service.setBlocked('user-1', true, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the user does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.setBlocked('missing', true, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      const user = { id: 'user-1' } as User;
      repository.findOneBy.mockResolvedValue(user);

      await expect(service.findById('user-1')).resolves.toBe(user);
    });

    it('throws NotFoundException when missing', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmailWithPassword', () => {
    it('selects the password field explicitly', async () => {
      repository.findOne.mockResolvedValue(null);

      await service.findByEmailWithPassword('a@test.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'a@test.com' },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          roles: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('setRefreshTokenHash', () => {
    it('updates the stored hash', async () => {
      repository.update.mockResolvedValue(undefined);

      await service.setRefreshTokenHash('user-1', 'hash');

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        { refreshTokenHash: 'hash' },
      );
    });
  });

  describe('findAll', () => {
    it('applies default pagination and orders by newest first', async () => {
      const users = [{ id: 'user-1' }] as User[];
      repository.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.findAll({});

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: undefined,
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
      expect(result).toEqual({ data: users, total: 1, page: 1, pageSize: 20 });
    });

    it('computes the offset from the requested page and pageSize', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 3, pageSize: 10 });

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('filters by email or name when search is provided', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ search: '  doe  ' });

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [{ email: ILike('%doe%') }, { name: ILike('%doe%') }],
        }),
      );
    });
  });
});
