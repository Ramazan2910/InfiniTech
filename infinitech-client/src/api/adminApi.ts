import { baseApi } from './baseApi';
import type { DashboardStats, UserDetail, PagedResult, User, UserRole } from '../types';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<DashboardStats, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Dashboard'],
    }),
    getAdminUsers: build.query<PagedResult<User>, { page?: number; pageSize?: number; role?: UserRole; isActive?: boolean; search?: string }>({
      query: (params) => ({ url: '/admin/users', params }),
      providesTags: ['Users'],
    }),
    getUserDetail: build.query<UserDetail, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Users', id }],
    }),
    changeUserStatus: build.mutation<void, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({ url: `/admin/users/${id}/status`, method: 'PUT', body: { isActive } }),
      invalidatesTags: ['Users'],
    }),
    changeUserRole: build.mutation<void, { id: string; role: UserRole }>({
      query: ({ id, role }) => ({ url: `/admin/users/${id}/role`, method: 'PUT', body: { role } }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetAdminUsersQuery,
  useGetUserDetailQuery,
  useChangeUserStatusMutation,
  useChangeUserRoleMutation,
} = adminApi;
