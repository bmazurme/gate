import { baseApi } from '../baseApi/baseApi';
import type { AuthUser, Role } from '../authApi/types';
import type { ListUsersParams, PaginatedUsers } from './types';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<PaginatedUsers, ListUsersParams>({
      query: ({ page, pageSize, search }) => ({
        url: '/users',
        params: { page, pageSize, search: search || undefined },
      }),
      providesTags: ['User'],
    }),
    getUser: builder.query<AuthUser, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    updateUserRoles: builder.mutation<AuthUser, { id: string; roles: Role[] }>({
      query: ({ id, roles }) => ({
        url: `/users/${id}/roles`,
        method: 'PATCH',
        body: { roles },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, 'User'],
    }),
    updateUserBlocked: builder.mutation<AuthUser, { id: string; isBlocked: boolean }>({
      query: ({ id, isBlocked }) => ({
        url: `/users/${id}/blocked`,
        method: 'PATCH',
        body: { isBlocked },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, 'User'],
    }),
  }),
});

export const {
  useListUsersQuery,
  useGetUserQuery,
  useUpdateUserRolesMutation,
  useUpdateUserBlockedMutation,
} = usersApi;
