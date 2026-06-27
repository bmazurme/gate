import { User } from '../entities/user.entity';

export class PaginatedUsersDto {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
}
