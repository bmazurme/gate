import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { Role } from '../roles/enums/role.enum';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hasAdmin = await this.hasAnyAdmin();
    const password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.usersRepository.create({
      ...dto,
      password,
      // Бутстрап: пока в системе нет ни одного администратора, следующий
      // зарегистрированный пользователь становится им автоматически —
      // иначе управлять ролями было бы попросту некому.
      roles: hasAdmin ? [Role.USER] : [Role.ADMIN],
    });
    return this.usersRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  findByIdOrNull(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
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
  }

  findByIdWithRefreshToken(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: { id: true, email: true, refreshTokenHash: true },
    });
  }

  async setRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.usersRepository.update({ id: userId }, { refreshTokenHash });
  }

  async findAll(query: ListUsersQueryDto): Promise<PaginatedUsersDto> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const search = query.search?.trim();

    const [data, total] = await this.usersRepository.findAndCount({
      where: search
        ? [{ email: ILike(`%${search}%`) }, { name: ILike(`%${search}%`) }]
        : undefined,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { data, total, page, pageSize };
  }

  async updateRoles(
    id: string,
    roles: Role[],
    actingUserId: string,
  ): Promise<User> {
    if (id === actingUserId) {
      throw new ForbiddenException('You cannot change your own roles');
    }

    const user = await this.findById(id);
    user.roles = roles;
    return this.usersRepository.save(user);
  }

  async setBlocked(
    id: string,
    isBlocked: boolean,
    actingUserId: string,
  ): Promise<User> {
    if (id === actingUserId) {
      throw new ForbiddenException('You cannot block or unblock yourself');
    }

    const user = await this.findById(id);
    user.isBlocked = isBlocked;
    return this.usersRepository.save(user);
  }

  private async hasAnyAdmin(): Promise<boolean> {
    const count = await this.usersRepository
      .createQueryBuilder('user')
      .where(':role = ANY(user.roles)', { role: Role.ADMIN })
      .getCount();
    return count > 0;
  }
}
