import { baseApi } from '../baseApi/baseApi';
import type { AccessDemoResponse, AccessDemoRoleResponse } from './types';

export const accessDemoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkBasicAccess: builder.query<AccessDemoResponse, void>({
      query: () => '/access-demo/basic',
    }),
    checkExtendedAccess: builder.query<AccessDemoResponse, void>({
      query: () => '/access-demo/extended',
    }),
    checkMaxAccess: builder.query<AccessDemoResponse, void>({
      query: () => '/access-demo/max',
    }),
    checkUserRoleAccess: builder.query<AccessDemoRoleResponse, void>({
      query: () => '/access-demo/role/user',
    }),
    checkAdminRoleAccess: builder.query<AccessDemoRoleResponse, void>({
      query: () => '/access-demo/role/admin',
    }),
  }),
});

export const {
  useLazyCheckBasicAccessQuery,
  useLazyCheckExtendedAccessQuery,
  useLazyCheckMaxAccessQuery,
  useLazyCheckUserRoleAccessQuery,
  useLazyCheckAdminRoleAccessQuery,
} = accessDemoApi;
