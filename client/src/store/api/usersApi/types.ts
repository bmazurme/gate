import type { AuthUser } from '../authApi/types';

export interface ListUsersParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedUsers {
  data: AuthUser[];
  total: number;
  page: number;
  pageSize: number;
}
